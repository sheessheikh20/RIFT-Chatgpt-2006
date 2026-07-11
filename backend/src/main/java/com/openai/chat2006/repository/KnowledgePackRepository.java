package com.openai.chat2006.repository;

import com.openai.chat2006.model.KnowledgePack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgePackRepository extends JpaRepository<KnowledgePack, String> {
    List<KnowledgePack> findByInstalled(boolean installed);
}
