package com.openai.chat2006.repository;

import com.openai.chat2006.model.Conversation;
import com.openai.chat2006.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    List<Conversation> findByUserAndFolderOrderByUpdatedAtDesc(User user, String folder);
    List<Conversation> findByUserOrderByUpdatedAtDesc(User user);
}
