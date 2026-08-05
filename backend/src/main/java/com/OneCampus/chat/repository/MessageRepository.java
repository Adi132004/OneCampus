package com.OneCampus.chat.repository;

import com.OneCampus.chat.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    @Query("select m from Message m where m.conversation.id = :conversationId order by m.timestamp asc")
    List<Message> findByConversationIdOrderByTimestampAsc(@Param("conversationId") UUID conversationId);

    @Query("select m from Message m where m.conversation.id = :conversationId order by m.timestamp desc")
    Page<Message> findByConversationIdOrderByTimestampDesc(@Param("conversationId") UUID conversationId, Pageable pageable);

    @Query("select count(m) from Message m where m.conversation.id = :conversationId and m.receiverId = :userId and m.read = false")
    long countUnreadByConversationAndReceiver(@Param("conversationId") UUID conversationId, @Param("userId") UUID userId);

    @Modifying
    @Query("update Message m set m.read = true where m.conversation.id = :conversationId and m.receiverId = :userId and m.read = false")
    int markAllReadInConversation(@Param("conversationId") UUID conversationId, @Param("userId") UUID userId);
}
