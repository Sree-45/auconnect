package com.example.backend.controller;

import com.example.backend.model.Review;
import com.example.backend.service.ReviewService;
import com.example.backend.service.GigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:5173")
public class ReviewController {
    
    @Autowired
    private ReviewService reviewService;
    
    @Autowired
    private GigService gigService;
    
    @PostMapping("/gig/{gigId}")
    public ResponseEntity<?> createReview(
            @PathVariable Long gigId,
            @RequestBody Review reviewRequest) {
        try {
            Review review = reviewService.createReview(gigId, reviewRequest);
            return ResponseEntity.ok(review);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/user/{username}")
    public ResponseEntity<?> getUserReviews(@PathVariable String username) {
        List<Review> reviews = reviewService.getUserReviews(username);
        Map<String, Object> stats = reviewService.getUserReviewStats(username);
        
        Map<String, Object> response = Map.of(
            "reviews", reviews,
            "stats", stats
        );
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/gig/{gigId}")
    public ResponseEntity<?> getGigReviews(@PathVariable Long gigId) {
        List<Review> reviews = reviewService.getGigReviews(gigId);
        return ResponseEntity.ok(reviews);
    }
    
    @GetMapping("/can-review")
    public ResponseEntity<?> canReviewGig(
            @RequestParam Long gigId,
            @RequestParam String username) {
        boolean canReview = reviewService.canReviewGig(gigId, username);
        return ResponseEntity.ok(Map.of("canReview", canReview));
    }
}
