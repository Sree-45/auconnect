package com.example.backend.controller;

import com.example.backend.model.Gig;
import com.example.backend.service.GigInterestService;
import com.example.backend.service.GigService;
import com.example.backend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/marketplace")
@CrossOrigin(origins = "http://localhost:5173")
public class GigController {

    @Autowired
    private GigService gigService;
    
    @Autowired
    private GigInterestService gigInterestService;
    
    @Autowired
    private ReviewService reviewService;
    
    @GetMapping
    public ResponseEntity<List<Gig>> getAllGigs() {
        List<Gig> gigs = gigService.getAllGigs();
        gigService.enrichGigsWithUserData(gigs);
        return ResponseEntity.ok(gigs);
    }
    
    @GetMapping("/user/{username}")
    public ResponseEntity<List<Gig>> getGigsByUsername(@PathVariable String username) {
        List<Gig> gigs = gigService.getGigsByUsername(username);
        gigService.enrichGigsWithUserData(gigs);
        return ResponseEntity.ok(gigs);
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Gig>> getGigsByCategory(@PathVariable String category) {
        List<Gig> gigs = gigService.getGigsByCategory(category);
        gigService.enrichGigsWithUserData(gigs);
        return ResponseEntity.ok(gigs);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Gig>> searchGigs(@RequestParam String term) {
        List<Gig> gigs = gigService.searchGigs(term);
        gigService.enrichGigsWithUserData(gigs);
        return ResponseEntity.ok(gigs);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Gig> getGigById(@PathVariable Long id) {
        Gig gig = gigService.getGigById(id);
        
        if (gig != null) {
            gigService.enrichGigWithUserData(gig);
            return ResponseEntity.ok(gig);
        }
        
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping
    public ResponseEntity<Gig> createGig(@RequestBody Gig gig) {
        Gig createdGig = gigService.createGig(gig);
        return new ResponseEntity<>(createdGig, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Gig> updateGig(@PathVariable Long id, @RequestBody Gig gigDetails) {
        Gig updatedGig = gigService.updateGig(id, gigDetails);
        
        if (updatedGig != null) {
            gigService.enrichGigWithUserData(updatedGig);
            return ResponseEntity.ok(updatedGig);
        }
        
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteGig(@PathVariable Long id) {
        boolean deleted = gigService.deleteGig(id);
        Map<String, Boolean> response = new HashMap<>();
        
        if (deleted) {
            response.put("deleted", true);
            return ResponseEntity.ok(response);
        }
        
        response.put("deleted", false);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
    
    @PostMapping("/{id}/view")
    public ResponseEntity<Gig> incrementViews(@PathVariable Long id) {
        Gig gig = gigService.incrementViews(id);
        
        if (gig != null) {
            gigService.enrichGigWithUserData(gig);
            return ResponseEntity.ok(gig);
        }
        
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping("/{id}/respond")
    public ResponseEntity<Gig> incrementResponses(@PathVariable Long id) {
        Gig gig = gigService.incrementResponses(id);
        
        if (gig != null) {
            gigService.enrichGigWithUserData(gig);
            return ResponseEntity.ok(gig);
        }
        
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/confirm-completion")
    public ResponseEntity<?> confirmCompletion(
            @PathVariable Long id,
            @RequestParam String username,
            @RequestParam String role) {
        
        Gig gig = gigService.getGigById(id);
        if (gig == null) {
            return ResponseEntity.notFound().build();
        }
        
        boolean wasUpdated = false;
        
        if ("provider".equals(role) && gig.getUsername().equals(username)) {
            gig.setProviderConfirmedCompletion(true);
            wasUpdated = true;
        } else if ("worker".equals(role)) {
            // Get the accepted username for this gig
            List<String> acceptedUsernames = gigInterestService.getAcceptedUsernamesForGig(id);
            
            // Check if the username is in the list of accepted usernames
            if (acceptedUsernames.contains(username)) {
                gig.setWorkerConfirmedCompletion(true);
                wasUpdated = true;
            }
        }
        
        // If both parties confirmed completion, mark the gig as completed
        if (gig.isProviderConfirmedCompletion() && gig.isWorkerConfirmedCompletion()) {
            gig.setStatus("Completed");
        }
        
        if (wasUpdated) {
            gigService.updateGig(id, gig);
            return ResponseEntity.ok(gig);
        } else {
            return ResponseEntity.badRequest().body("Invalid role or user for this gig");
        }
    }

    @GetMapping("/user/{username}/completed")
    public ResponseEntity<List<Gig>> getCompletedGigsForUser(@PathVariable String username) {
        List<Gig> completedGigs = gigService.getCompletedGigsForUser(username);
        
        // Attach review eligibility information
        for (Gig gig : completedGigs) {
            boolean canReview = reviewService.canReviewGig(gig.getId(), username);
            gig.setCanReview(canReview);
        }
        
        return ResponseEntity.ok(completedGigs);
    }
}