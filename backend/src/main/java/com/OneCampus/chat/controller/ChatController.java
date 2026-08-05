package com.OneCampus.chat.controller;

import com.OneCampus.chat.dto.*;
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

    // ─── Conversations ────────────────────────────────────────────────────────

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDto>> listConversations(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        if (authenticatedUser == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(chatService.listConversations(authenticatedUser));
    }

    @PostMapping("/conversations")
    public ResponseEntity<ConversationDto> createConversation(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @Valid @RequestBody CreateConversationRequest request) {
        if (authenticatedUser == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(chatService.createConversation(authenticatedUser, request));
    }

    // ─── Messages ─────────────────────────────────────────────────────────────

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<MessageDto>> listMessages(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable UUID conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        if (authenticatedUser == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(chatService.listMessages(authenticatedUser, conversationId, page, size));
    }

    @PostMapping("/messages")
    public ResponseEntity<MessageDto> sendMessage(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @Valid @RequestBody SendMessageRequest request) {
        if (authenticatedUser == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(chatService.sendMessage(authenticatedUser, request));
    }

    // ─── Mark Read ────────────────────────────────────────────────────────────

    @PostMapping("/conversations/{conversationId}/read")
    public ResponseEntity<Void> markRead(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable UUID conversationId) {
        if (authenticatedUser == null) return ResponseEntity.status(401).build();
        chatService.markMessagesAsRead(authenticatedUser, conversationId);
        return ResponseEntity.ok().build();
    }

    // ─── User Search ──────────────────────────────────────────────────────────

    @GetMapping("/users/search")
    public ResponseEntity<List<UserSearchDto>> searchUsers(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestParam String q) {
        if (authenticatedUser == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(chatService.searchUsers(authenticatedUser, q));
    }
}
