package com.OneCampus.chat.repository;

import com.OneCampus.chat.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    @Query("select c from Conversation c where (c.user1Id = :userId or c.user2Id = :userId)")
    List<Conversation> findConversationsForUser(@Param("userId") UUID userId);

    Optional<Conversation> findByLostReportIdAndUser1IdAndUser2Id(UUID lostReportId, UUID user1Id, UUID user2Id);

    Optional<Conversation> findByLostReportIdAndUser2IdAndUser1Id(UUID lostReportId, UUID user2Id, UUID user1Id);
}
