package com.OneCampus.chat.service;

import com.OneCampus.chat.dto.ConversationDto;
import com.OneCampus.chat.dto.CreateConversationRequest;
import com.OneCampus.chat.dto.MessageDto;
import com.OneCampus.chat.dto.SendMessageRequest;
import com.OneCampus.chat.entity.Conversation;
import com.OneCampus.chat.entity.Message;
import com.OneCampus.chat.repository.ConversationRepository;
import com.OneCampus.chat.repository.MessageRepository;
import com.OneCampus.common.security.AuthenticatedUser;
import com.OneCampus.identity.dto.UserDto;
import com.OneCampus.identity.service.IdentityService;
import com.OneCampus.lostfound.entity.LostFoundItem;
import com.OneCampus.lostfound.repository.LostFoundItemRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final LostFoundItemRepository lostFoundItemRepository;
    private final IdentityService identityService;

    public ChatService(ConversationRepository conversationRepository, MessageRepository messageRepository,
                       LostFoundItemRepository lostFoundItemRepository, IdentityService identityService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.lostFoundItemRepository = lostFoundItemRepository;
        this.identityService = identityService;
    }

    @Transactional
    public ConversationDto createConversation(AuthenticatedUser authenticatedUser, CreateConversationRequest request) {
        UserDto currentUser = identityService.getCurrentUser(authenticatedUser);
        Optional<Conversation> existing = conversationRepository.findByLostReportIdAndUser1IdAndUser2Id(request.lostReportId(), currentUser.id(), request.otherUserId())
                .or(() -> conversationRepository.findByLostReportIdAndUser2IdAndUser1Id(request.lostReportId(), currentUser.id(), request.otherUserId()));
        if (existing.isPresent()) {
            return toDto(existing.get(), currentUser.id());
        }

        LostFoundItem lostFoundItem = lostFoundItemRepository.findById(request.lostReportId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lost report not found"));
        if (!lostFoundItem.getCampusId().equals(authenticatedUser.campusId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Lost report is not in your campus");
        }

        if (currentUser.id().equals(lostFoundItem.getOwnerId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot create a conversation for your own report");
        }
        if (!request.otherUserId().equals(lostFoundItem.getOwnerId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Other user must be the report owner");
        }

        Conversation conversation = new Conversation(request.lostReportId(), currentUser.id(), request.otherUserId());
        Conversation saved = conversationRepository.save(conversation);
        return toDto(saved, currentUser.id());
    }

    public List<ConversationDto> listConversations(AuthenticatedUser authenticatedUser) {
        UserDto currentUser = identityService.getCurrentUser(authenticatedUser);
        return conversationRepository.findConversationsForUser(currentUser.id()).stream()
                .filter(conversation -> lostFoundItemRepository.findById(conversation.getLostReportId())
                        .map(item -> item.getCampusId().equals(authenticatedUser.campusId()))
                        .orElse(false)
                )
                .map(conversation -> toDto(conversation, currentUser.id()))
                .sorted(Comparator.comparing(ConversationDto::lastMessageAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    public List<MessageDto> listMessages(AuthenticatedUser authenticatedUser, UUID conversationId) {
        UserDto currentUser = identityService.getCurrentUser(authenticatedUser);
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));
        if (!isParticipant(conversation, currentUser.id())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a participant in this conversation");
        }

        LostFoundItem lostFoundItem = lostFoundItemRepository.findById(conversation.getLostReportId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lost report not found"));
        if (!lostFoundItem.getCampusId().equals(authenticatedUser.campusId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found");
        }

        return messageRepository.findByConversationIdOrderByTimestampAsc(conversationId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageDto sendMessage(AuthenticatedUser authenticatedUser, SendMessageRequest request) {
        UserDto currentUser = identityService.getCurrentUser(authenticatedUser);
        Conversation conversation = conversationRepository.findById(request.conversationId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));
        if (!isParticipant(conversation, currentUser.id())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a participant in this conversation");
        }

        LostFoundItem lostFoundItem = lostFoundItemRepository.findById(conversation.getLostReportId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lost report not found"));
        if (!lostFoundItem.getCampusId().equals(authenticatedUser.campusId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found");
        }

        if (!conversation.getUser1Id().equals(request.receiverId()) && !conversation.getUser2Id().equals(request.receiverId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid receiver for this conversation");
        }

        Message message = new Message(conversation, currentUser.id(), request.receiverId(), request.message());
        return toDto(messageRepository.save(message));
    }

    private boolean isParticipant(Conversation conversation, UUID userId) {
        return conversation.getUser1Id().equals(userId) || conversation.getUser2Id().equals(userId);
    }

    private ConversationDto toDto(Conversation conversation, UUID currentUserId) {
        UUID otherUserId = conversation.getUser1Id().equals(currentUserId) ? conversation.getUser2Id() : conversation.getUser1Id();
        UserDto otherUser = identityService.getCurrentUser(new AuthenticatedUser(otherUserId, null));
        List<Message> messages = messageRepository.findByConversationIdOrderByTimestampAsc(conversation.getId());
        Message latest = messages.isEmpty() ? null : messages.get(messages.size() - 1);
        return new ConversationDto(
                conversation.getId(),
                conversation.getLostReportId(),
                conversation.getUser1Id(),
                conversation.getUser2Id(),
                conversation.getCreatedAt(),
                otherUser.name(),
                otherUser.email(),
                latest != null ? latest.getMessage() : null,
                latest != null ? latest.getTimestamp() : null
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
                message.isRead()
        );
    }
}
