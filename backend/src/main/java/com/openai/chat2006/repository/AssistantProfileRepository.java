package com.openai.chat2006.repository;

import com.openai.chat2006.model.AssistantProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssistantProfileRepository extends JpaRepository<AssistantProfile, String> {
    List<AssistantProfile> findAllByOrderByDisplayNameAsc();
}
