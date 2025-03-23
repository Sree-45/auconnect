package com.example.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Table(name = "marketplace_gigs")
public class Gig {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    
    @Column(length = 1000)
    private String description;
    
    private String username;
    
    private String category;
    
    private double price;
    
    private String location;
    
    private String duration;
    
    private String status = "Active";
    
    private int views = 0;
    
    private int responses = 0;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @Transient 
    private String userFullName;
    
    @Transient 
    private String userProfilePhoto;
    
    private double rating = 0.0; 
    @Column(columnDefinition = "TEXT")
    private String skillsRequired;
    
    @Column(name = "provider_confirmed_completion")
    private boolean providerConfirmedCompletion = false;
    
    @Column(name = "worker_confirmed_completion")
    private boolean workerConfirmedCompletion = false;
    
    @Transient
    private boolean canReview;

    public boolean isCanReview() {
        return canReview;
    }

    public void setCanReview(boolean canReview) {
        this.canReview = canReview;
    }

    public String getSkillsRequired() {
        return skillsRequired;
    }
    
    public void setSkillsRequired(String skillsRequired) {
        this.skillsRequired = skillsRequired;
    }
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public double getPrice() {
        return price;
    }
    
    public void setPrice(double price) {
        this.price = price;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public String getDuration() {
        return duration;
    }
    
    public void setDuration(String duration) {
        this.duration = duration;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public int getViews() {
        return views;
    }
    
    public void setViews(int views) {
        this.views = views;
    }
    
    public int getResponses() {
        return responses;
    }
    
    public void setResponses(int responses) {
        this.responses = responses;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public double getRating() {
        return rating;
    }
    
    public void setRating(double rating) {
        this.rating = rating;
    }
    
    public String getUserFullName() {
        return userFullName;
    }
    
    public void setUserFullName(String userFullName) {
        this.userFullName = userFullName;
    }
    
    public String getUserProfilePhoto() {
        return userProfilePhoto;
    }
    
    public void setUserProfilePhoto(String userProfilePhoto) {
        this.userProfilePhoto = userProfilePhoto;
    }
    
    public boolean isProviderConfirmedCompletion() {
        return providerConfirmedCompletion;
    }
    
    public void setProviderConfirmedCompletion(boolean providerConfirmedCompletion) {
        this.providerConfirmedCompletion = providerConfirmedCompletion;
    }
    
    public boolean isWorkerConfirmedCompletion() {
        return workerConfirmedCompletion;
    }
    
    public void setWorkerConfirmedCompletion(boolean workerConfirmedCompletion) {
        this.workerConfirmedCompletion = workerConfirmedCompletion;
    }
    
    @Transient
    public String getDatePosted() {
        return createdAt != null ? createdAt.toString() : null;
    }
}
