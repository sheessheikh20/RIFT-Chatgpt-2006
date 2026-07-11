package com.openai.chat2006.repository;

import com.openai.chat2006.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByUsername(String username);
    Optional<User> findBySerialNumber(String serialNumber);
    boolean existsByUsername(String username);
}
