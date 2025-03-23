package com.example.backend.repository;

import com.example.backend.model.Gig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GigRepository extends JpaRepository<Gig, Long> {
    List<Gig> findByUsername(String username);
    List<Gig> findByCategory(String category);
    List<Gig> findByOrderByCreatedAtDesc();
    List<Gig> findByTitleContainingOrDescriptionContainingOrderByCreatedAtDesc(String titleTerm, String descriptionTerm);
}