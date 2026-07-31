package com.OneCampus.chat.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "conversations")
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "lost_report_id", nullable = false)
    private UUID lostReportId;

    @Column(name = "user1_id", nullable = false)
    private UUID user1Id;

    @Column(name = "user2_id", nullable = false)
    private UUID user2Id;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Conversation() {
    }

    public Conversation(UUID lostReportId, UUID user1Id, UUID user2Id) {
        this.lostReportId = lostReportId;
        this.user1Id = user1Id;
        this.user2Id = user2Id;
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getLostReportId() {
        return lostReportId;
    }

    public UUID getUser1Id() {
        return user1Id;
    }

    public UUID getUser2Id() {
        return user2Id;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
