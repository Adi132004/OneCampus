package com.OneCampus.chat.controller;

import com.OneCampus.chat.dto.MessageDto;
import com.OneCampus.chat.dto.SendMessageRequest;
import com.OneCampus.chat.service.ChatService;
import com.OneCampus.common.security.AuthenticatedUser;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.security.Principal;

/**
 * Handles STOMP messages sent from the frontend to /app/chat.message.
 * The JwtWebSocketAuthInterceptor sets the Principal on CONNECT.
 */
@Controller
public class ChatWsController {

    private final ChatService chatService;

    public ChatWsController(ChatService chatService) {
        this.chatService = chatService;
    }

    @MessageMapping("/chat.message")
    public void handleMessage(@Payload SendMessageRequest request, Principal principal) {
        if (principal == null) return;

        AuthenticatedUser authenticatedUser = null;
        if (principal instanceof Authentication authentication
                && authentication.getPrincipal() instanceof AuthenticatedUser au) {
            authenticatedUser = au;
        }

        if (authenticatedUser == null) return;

        // Delegates to service which saves + broadcasts via SimpMessagingTemplate
        chatService.handleWebSocketMessage(authenticatedUser, request);
    }
}
