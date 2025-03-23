package com.example.backend.repository;

import com.example.backend.model.UserPaymentLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserPaymentLinkRepository extends JpaRepository<UserPaymentLink, Long> {
    Optional<UserPaymentLink> findByUsername(String username);
    boolean existsByUsername(String username);
}
