package com.example.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;

@Entity
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String fromUsername;
    private String toUsername;
    private String text;
    private LocalDateTime timestamp;
    private boolean isRead;
    
    private String attachmentUrl;
    private String attachmentType; 
    private String attachmentName;
    
    public Message() {
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getFromUsername() {
        return fromUsername;
    }
    
    public void setFromUsername(String fromUsername) {
        this.fromUsername = fromUsername;
    }
    
    public String getToUsername() {
        return toUsername;
    }
    
    public void setToUsername(String toUsername) {
        this.toUsername = toUsername;
    }
    
    public String getText() {
        return text;
    }
    
    public void setText(String text) {
        this.text = text;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public boolean isRead() {
        return isRead;
    }
    
    public void setRead(boolean read) {
        this.isRead = read;
    }
    
    public String getAttachmentUrl() {
        return attachmentUrl;
    }
    
    public void setAttachmentUrl(String attachmentUrl) {
        this.attachmentUrl = attachmentUrl;
    }
    
    public String getAttachmentType() {
        return attachmentType;
    }
    
    public void setAttachmentType(String attachmentType) {
        this.attachmentType = attachmentType;
    }
    
    public String getAttachmentName() {
        return attachmentName;
    }
    
    public void setAttachmentName(String attachmentName) {
        this.attachmentName = attachmentName;
    }
}