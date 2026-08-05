package com.OneCampus.chat.service;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Tracks which users are currently connected via WebSocket.
 * On connect/disconnect it broadcasts presence events to /topic/presence.
 */
@Service
public class UserPresenceService {

    // userId-string → last-seen timestamp
    private final ConcurrentHashMap<String, Instant> onlineUsers = new ConcurrentHashMap<>();

    private final SimpMessagingTemplate messagingTemplate;

    public UserPresenceService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @EventListener
    public void handleConnect(SessionConnectedEvent event) {
        Principal user = event.getUser();
        if (user != null) {
            onlineUsers.put(user.getName(), Instant.now());
            broadcast(user.getName(), true);
        }
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        Principal user = event.getUser();
        if (user != null) {
            onlineUsers.remove(user.getName());
            broadcast(user.getName(), false);
        }
    }

    public boolean isOnline(String userId) {
        return onlineUsers.containsKey(userId);
    }

    private void broadcast(String userId, boolean online) {
        Object event = Map.of("userId", userId, "online", online);
        messagingTemplate.convertAndSend("/topic/presence", event);
    }
}
