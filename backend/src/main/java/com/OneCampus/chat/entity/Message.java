package com.OneCampus.chat.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @Column(name = "sender_id", nullable = false)
    private UUID senderId;

    @Column(name = "receiver_id", nullable = false)
    private UUID receiverId;

    @Column(columnDefinition = "text", nullable = false)
    private String message;

    @Column(nullable = false)
    private Instant timestamp;

    @Column(name = "is_read", nullable = false)
    private boolean read;

    protected Message() {
    }

    public Message(Conversation conversation, UUID senderId, UUID receiverId, String message) {
        this.conversation = conversation;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.message = message;
        this.timestamp = Instant.now();
        this.read = false;
    }

    public UUID getId() {
        return id;
    }

    public Conversation getConversation() {
        return conversation;
    }

    public UUID getSenderId() {
        return senderId;
    }

    public UUID getReceiverId() {
        return receiverId;
    }

    public String getMessage() {
        return message;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }
}
