package com.OneCampus.chat.repository;

import com.OneCampus.chat.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    @Query("select m from Message m where m.conversation.id = :conversationId order by m.timestamp asc")
    List<Message> findByConversationIdOrderByTimestampAsc(@Param("conversationId") UUID conversationId);
}
