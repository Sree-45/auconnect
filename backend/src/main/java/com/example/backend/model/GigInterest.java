package com.example.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "gig_interests", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"gig_id", "username"})
})
public class GigInterest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "gig_id")
    private Long gigId;
    
    @Column(name = "username")
    private String username;
    
    @Column(name = "created_date")
    private LocalDateTime createdDate;
    
    @Column(name = "status")
    private String status = "pending"; 
    
    public GigInterest() {}
    
    public GigInterest(Long gigId, String username) {
        this.gigId = gigId;
        this.username = username;
        this.createdDate = LocalDateTime.now();
    }
    
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
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public LocalDateTime getCreatedDate() {
        return createdDate;
    }
    
    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
}
