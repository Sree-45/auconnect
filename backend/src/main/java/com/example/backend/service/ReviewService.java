package com.example.backend.service;

import com.example.backend.model.Gig;
import com.example.backend.model.Review;
import com.example.backend.model.Users;
import com.example.backend.repository.GigRepository;
import com.example.backend.repository.ReviewRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ReviewService {
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private GigRepository gigRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private GigService gigService;

    @Autowired
    private GigInterestService gigInterestService; 
    
    public Review createReview(Long gigId, Review reviewRequest) {
        Gig gig = gigRepository.findById(gigId)
                .orElseThrow(() -> new RuntimeException("Gig not found"));
        
        // Check if the gig is completed
        if (!"Completed".equals(gig.getStatus())) {
            throw new RuntimeException("Cannot review a gig that is not completed");
        }
        
        // Check if the reviewer has already reviewed this gig
        if (reviewRepository.existsByGigIdAndReviewerUsername(gigId, reviewRequest.getReviewerUsername())) {
            throw new RuntimeException("You have already reviewed this gig");
        }
        
        // Set appropriate fields
        reviewRequest.setGigId(gigId);
        reviewRequest.setCreatedAt(LocalDateTime.now());
        
        // Save review
        Review savedReview = reviewRepository.save(reviewRequest);
        
        // Update the user's average rating
        updateUserRating(reviewRequest.getRevieweeUsername());
        
        return savedReview;
    }
    
    public List<Review> getUserReviews(String username) {
        return reviewRepository.findByRevieweeUsername(username);
    }
    
    public Map<String, Object> getUserReviewStats(String username) {
        Map<String, Object> stats = new HashMap<>();
        
        Double avgRating = reviewRepository.getAverageRatingForUser(username);
        Integer reviewCount = reviewRepository.getReviewCountForUser(username);
        
        stats.put("avgRating", avgRating != null ? avgRating : 0.0);
        stats.put("reviewCount", reviewCount != null ? reviewCount : 0);
        
        return stats;
    }
    
    private void updateUserRating(String username) {
        Double avgRating = reviewRepository.getAverageRatingForUser(username);
        if (avgRating != null) {
            Users user = userRepository.findByUsername(username);
            if (user != null) {
                // If you have a rating field in the Users model, update it
                // user.setRating(avgRating);
                // userRepository.save(user);
                
                // Update ratings on all the user's gigs
                List<Gig> userGigs = gigRepository.findByUsername(username);
                for (Gig gig : userGigs) {
                    gig.setRating(avgRating);
                    gigService.updateGig(gig.getId(), gig);
                }
            }
        }
    }
    
    public List<Review> getGigReviews(Long gigId) {
        return reviewRepository.findByGigId(gigId);
    }
    
    public boolean canReviewGig(Long gigId, String username) {
        // Check if the gig is completed
        Gig gig = gigRepository.findById(gigId).orElse(null);
        if (gig == null || !"Completed".equals(gig.getStatus())) {
            return false;
        }
        
        // Check if the user is either the gig owner or one of the accepted workers
        boolean isGigOwner = gig.getUsername().equals(username);
        List<String> acceptedUsernames = gigInterestService.getAcceptedUsernamesForGig(gigId);
        boolean isAcceptedWorker = acceptedUsernames.contains(username);
        
        if (!isGigOwner && !isAcceptedWorker) {
            return false;
        }
        
        // Check if the user has already reviewed this gig
        return !reviewRepository.existsByGigIdAndReviewerUsername(gigId, username);
    }
}
