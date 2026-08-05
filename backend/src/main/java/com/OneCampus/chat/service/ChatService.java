package com.OneCampus.chat.service;

import com.OneCampus.chat.dto.*;
import com.OneCampus.chat.entity.Conversation;
import com.OneCampus.chat.entity.Message;
import com.OneCampus.chat.repository.ConversationRepository;
import com.OneCampus.chat.repository.MessageRepository;
import com.OneCampus.common.security.AuthenticatedUser;
import com.OneCampus.identity.dto.UserDto;
import com.OneCampus.identity.entity.User;
import com.OneCampus.identity.repository.UserRepository;
import com.OneCampus.identity.service.IdentityService;
import com.OneCampus.lostfound.entity.LostFoundItem;
import com.OneCampus.lostfound.repository.LostFoundItemRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final LostFoundItemRepository lostFoundItemRepository;
    private final IdentityService identityService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatService(
            ConversationRepository conversationRepository,
            MessageRepository messageRepository,
            LostFoundItemRepository lostFoundItemRepository,
            IdentityService identityService,
            UserRepository userRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.lostFoundItemRepository = lostFoundItemRepository;
        this.identityService = identityService;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    // ─── Create Conversation ──────────────────────────────────────────────────

    @Transactional
    public ConversationDto createConversation(AuthenticatedUser authenticatedUser, CreateConversationRequest request) {
        UserDto currentUser = identityService.getCurrentUser(authenticatedUser);

        if (currentUser.id().equals(request.otherUserId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot start a conversation with yourself");
        }

        // Verify the other user exists
        userRepository.findById(request.otherUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (request.lostReportId() != null) {
            // LostFound-linked conversation (original flow)
            return createLostFoundConversation(currentUser, request);
        } else {
            // Direct conversation
            return createDirectConversation(currentUser, request.otherUserId());
        }
    }

    private ConversationDto createLostFoundConversation(UserDto currentUser, CreateConversationRequest request) {
        Optional<Conversation> existing = conversationRepository
                .findByLostReportIdAndUser1IdAndUser2Id(request.lostReportId(), currentUser.id(), request.otherUserId())
                .or(() -> conversationRepository.findByLostReportIdAndUser2IdAndUser1Id(
                        request.lostReportId(), currentUser.id(), request.otherUserId()));
        if (existing.isPresent()) {
            return toDto(existing.get(), currentUser.id());
        }

        LostFoundItem lostFoundItem = lostFoundItemRepository.findById(request.lostReportId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lost report not found"));

        if (currentUser.id().equals(lostFoundItem.getOwnerId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot create a conversation for your own report");
        }
        if (!request.otherUserId().equals(lostFoundItem.getOwnerId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Other user must be the report owner");
        }

        Conversation conversation = new Conversation(request.lostReportId(), currentUser.id(), request.otherUserId());
        return toDto(conversationRepository.save(conversation), currentUser.id());
    }

    private ConversationDto createDirectConversation(UserDto currentUser, UUID otherUserId) {
        Optional<Conversation> existing = conversationRepository.findDirectConversation(currentUser.id(), otherUserId);
        if (existing.isPresent()) {
            return toDto(existing.get(), currentUser.id());
        }
        Conversation conversation = new Conversation(currentUser.id(), otherUserId);
        return toDto(conversationRepository.save(conversation), currentUser.id());
    }

    // ─── List Conversations ───────────────────────────────────────────────────

    public List<ConversationDto> listConversations(AuthenticatedUser authenticatedUser) {
        UserDto currentUser = identityService.getCurrentUser(authenticatedUser);
        return conversationRepository.findConversationsForUser(currentUser.id()).stream()
                .map(conversation -> toDto(conversation, currentUser.id()))
                .sorted(Comparator.comparing(ConversationDto::lastMessageAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    // ─── List Messages (paginated) ────────────────────────────────────────────

    public List<MessageDto> listMessages(AuthenticatedUser authenticatedUser, UUID conversationId, int page, int size) {
        UserDto currentUser = identityService.getCurrentUser(authenticatedUser);
        Conversation conversation = getConversationAsParticipant(conversationId, currentUser.id());

        // Return newest page sorted ascending for the view
        var pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        List<MessageDto> messages = messageRepository.findByConversationIdOrderByTimestampDesc(conversationId, pageable)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        // Reverse to get ascending order for the chat view
        Collections.reverse(messages);
        return messages;
    }

    // ─── Send Message (REST fallback) ─────────────────────────────────────────

    @Transactional
    public MessageDto sendMessage(AuthenticatedUser authenticatedUser, SendMessageRequest request) {
        UserDto currentUser = identityService.getCurrentUser(authenticatedUser);
        Conversation conversation = getConversationAsParticipant(request.conversationId(), currentUser.id());

        if (!conversation.getUser1Id().equals(request.receiverId()) && !conversation.getUser2Id().equals(request.receiverId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid receiver for this conversation");
        }

        Message message = new Message(conversation, currentUser.id(), request.receiverId(), request.message());
        message.setDelivered(true);
        MessageDto dto = toDto(messageRepository.save(message));

        // Broadcast via WebSocket so the other user gets it in real time
        broadcastMessage(dto);
        return dto;
    }

    // ─── Mark As Read ─────────────────────────────────────────────────────────

    @Transactional
    public void markMessagesAsRead(AuthenticatedUser authenticatedUser, UUID conversationId) {
        UserDto currentUser = identityService.getCurrentUser(authenticatedUser);
        getConversationAsParticipant(conversationId, currentUser.id());

        int updated = messageRepository.markAllReadInConversation(conversationId, currentUser.id());
        if (updated > 0) {
            // Notify the sender that their messages have been read
            // Cast to Object to resolve convertAndSend(String, Object) overload ambiguity
            Object readEvent = Map.of(
                    "conversationId", conversationId.toString(),
                    "readBy", currentUser.id().toString());
            messagingTemplate.convertAndSend(
                    "/topic/conversation." + conversationId + ".read", readEvent);
        }
    }

    // ─── Search Users ─────────────────────────────────────────────────────────

    public List<UserSearchDto> searchUsers(AuthenticatedUser authenticatedUser, String query) {
        UserDto currentUser = identityService.getCurrentUser(authenticatedUser);
        UUID campusId = currentUser.campusId();
        List<User> users = userRepository.searchByCampusAndName(campusId, query.trim());
        return users.stream()
                .filter(u -> !u.getId().equals(currentUser.id()))  // exclude self
                .map(u -> new UserSearchDto(u.getId(), u.getName(), u.getEmail()))
                .collect(Collectors.toList());
    }

    // ─── WebSocket Message Handler (called from ChatWsController) ────────────

    @Transactional
    public MessageDto handleWebSocketMessage(AuthenticatedUser authenticatedUser, SendMessageRequest request) {
        return sendMessage(authenticatedUser, request);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private void broadcastMessage(MessageDto dto) {
        // Broadcast to the conversation topic
        messagingTemplate.convertAndSend("/topic/conversation." + dto.conversationId(), dto);
        // Also notify receiver's personal queue so they can update conversation list
        messagingTemplate.convertAndSendToUser(
                dto.receiverId().toString(),
                "/queue/conversations",
                dto
        );
    }

    private Conversation getConversationAsParticipant(UUID conversationId, UUID userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));
        if (!isParticipant(conversation, userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a participant in this conversation");
        }
        return conversation;
    }

    private boolean isParticipant(Conversation conversation, UUID userId) {
        return conversation.getUser1Id().equals(userId) || conversation.getUser2Id().equals(userId);
    }

    private ConversationDto toDto(Conversation conversation, UUID currentUserId) {
        UUID otherUserId = conversation.getUser1Id().equals(currentUserId)
                ? conversation.getUser2Id() : conversation.getUser1Id();

        UserDto otherUser = identityService.getCurrentUser(new AuthenticatedUser(otherUserId, null));
        List<Message> messages = messageRepository.findByConversationIdOrderByTimestampAsc(conversation.getId());
        Message latest = messages.isEmpty() ? null : messages.get(messages.size() - 1);
        long unread = messageRepository.countUnreadByConversationAndReceiver(conversation.getId(), currentUserId);

        return new ConversationDto(
                conversation.getId(),
                conversation.getLostReportId(),
                conversation.getUser1Id(),
                conversation.getUser2Id(),
                otherUserId,
                conversation.getCreatedAt(),
                otherUser.name(),
                otherUser.email(),
                latest != null ? latest.getMessage() : null,
                latest != null ? latest.getTimestamp() : null,
                unread
        );
    }

    private MessageDto toDto(Message message) {
        return new MessageDto(
                message.getId(),
                message.getConversation().getId(),
                message.getSenderId(),
                message.getReceiverId(),
                message.getMessage(),
                message.getTimestamp(),
                message.isRead(),
                message.isDelivered()
        );
    }
}
