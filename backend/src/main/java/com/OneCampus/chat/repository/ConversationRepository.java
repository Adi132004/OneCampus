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

    /** Find a direct (no lostReport) conversation between two users (either direction). */
    @Query("""
            select c from Conversation c
            where c.lostReportId is null
              and ((c.user1Id = :a and c.user2Id = :b)
                or (c.user1Id = :b and c.user2Id = :a))
            """)
    Optional<Conversation> findDirectConversation(@Param("a") UUID userA, @Param("b") UUID userB);
}
