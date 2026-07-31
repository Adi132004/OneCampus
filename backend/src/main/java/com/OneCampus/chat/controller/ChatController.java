package com.OneCampus.chat.controller;

import com.OneCampus.chat.dto.ConversationDto;
import com.OneCampus.chat.dto.CreateConversationRequest;
import com.OneCampus.chat.dto.MessageDto;
import com.OneCampus.chat.dto.SendMessageRequest;
import com.OneCampus.chat.service.ChatService;
import com.OneCampus.common.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDto>> listConversations(@AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        if (authenticatedUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(chatService.listConversations(authenticatedUser));
    }

    @PostMapping("/conversations")
    public ResponseEntity<ConversationDto> createConversation(@AuthenticationPrincipal AuthenticatedUser authenticatedUser,
                                                              @Valid @RequestBody CreateConversationRequest request) {
        if (authenticatedUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(chatService.createConversation(authenticatedUser, request));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<MessageDto>> listMessages(@AuthenticationPrincipal AuthenticatedUser authenticatedUser,
                                                         @PathVariable UUID conversationId) {
        if (authenticatedUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(chatService.listMessages(authenticatedUser, conversationId));
    }

    @PostMapping("/messages")
    public ResponseEntity<MessageDto> sendMessage(@AuthenticationPrincipal AuthenticatedUser authenticatedUser,
                                                  @Valid @RequestBody SendMessageRequest request) {
        if (authenticatedUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(chatService.sendMessage(authenticatedUser, request));
    }
}
