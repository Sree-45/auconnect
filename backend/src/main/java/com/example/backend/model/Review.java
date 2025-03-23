package com.example.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "marketplace_reviews")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long gigId;
    private String reviewerUsername;
    private String revieweeUsername;
    private int rating; // 1-5 stars
    private String comment;
    private LocalDateTime createdAt;
    private boolean isWorkerReview; // true if worker is reviewing provider, false otherwise
    
    // Additional rating categories
    private int communicationRating;
    private int qualityRating;
    private int valueRating;
    private int reliabilityRating;

    public Review() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getGigId() {
        return gigId;
    }

    public void setGigId(Long gigId) {
        this.gigId = gigId;
    }

    public String getReviewerUsername() {
        return reviewerUsername;
    }

    public void setReviewerUsername(String reviewerUsername) {
        this.reviewerUsername = reviewerUsername;
    }

    public String getRevieweeUsername() {
        return revieweeUsername;
    }

    public void setRevieweeUsername(String revieweeUsername) {
        this.revieweeUsername = revieweeUsername;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isWorkerReview() {
        return isWorkerReview;
    }

    public void setWorkerReview(boolean workerReview) {
        isWorkerReview = workerReview;
    }
    
    public int getCommunicationRating() {
        return communicationRating;
    }

    public void setCommunicationRating(int communicationRating) {
        this.communicationRating = communicationRating;
    }

    public int getQualityRating() {
        return qualityRating;
    }

    public void setQualityRating(int qualityRating) {
        this.qualityRating = qualityRating;
    }

    public int getValueRating() {
        return valueRating;
    }

    public void setValueRating(int valueRating) {
        this.valueRating = valueRating;
    }

    public int getReliabilityRating() {
        return reliabilityRating;
    }

    public void setReliabilityRating(int reliabilityRating) {
        this.reliabilityRating = reliabilityRating;
    }
}
