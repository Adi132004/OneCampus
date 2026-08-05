package com.OneCampus.common.security;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.UUID;

/**
 * Validates JWT on the STOMP CONNECT frame.
 * The frontend sends the access-token in the STOMP passcode header.
 */
@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;

    public WebSocketAuthInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = accessor.getPasscode(); // token is sent as the STOMP passcode
            if (token == null || token.isBlank()) {
                // Also check the Authorization native header (some clients use this)
                String authHeader = accessor.getFirstNativeHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    token = authHeader.substring(7);
                }
            }

            if (token != null && !token.isBlank() && jwtService.isValid(token)) {
                try {
                    UUID userId = jwtService.extractUserId(token);
                    String campusId = jwtService.extractCampusId(token);
                    AuthenticatedUser principal = new AuthenticatedUser(userId, campusId);
                    Authentication auth = new UsernamePasswordAuthenticationToken(
                            principal, null, Collections.emptyList());
                    accessor.setUser(auth);
                } catch (Exception ignored) {
                    // invalid token — no user set; broker will handle unauthenticated
                }
            }
        }

        return message;
    }
}
