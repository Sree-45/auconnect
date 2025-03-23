package com.example.backend.repository;

import com.example.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByRevieweeUsername(String revieweeUsername);
    
    List<Review> findByGigId(Long gigId);
    
    boolean existsByGigIdAndReviewerUsername(Long gigId, String reviewerUsername);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.revieweeUsername = ?1")
    Double getAverageRatingForUser(String username);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.revieweeUsername = ?1")
    Integer getReviewCountForUser(String username);
}
