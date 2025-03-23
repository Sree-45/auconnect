package com.example.backend.controller;
import com.example.backend.dto.UserInterestDTO;
import com.example.backend.model.Gig;
import com.example.backend.model.Users;
import com.example.backend.service.GigInterestService;
import com.example.backend.service.GigService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marketplace") 
@CrossOrigin(origins = "http://localhost:5173")
public class MarketplaceController {

    @Autowired
    private GigInterestService gigInterestService;
    
    @Autowired
    private GigService gigService;

    @PostMapping("/{gigId}/interest")
    public ResponseEntity<?> toggleGigInterest(
            @PathVariable Long gigId,
            @RequestParam String username,
            @RequestParam boolean interested) {
        
        boolean result = gigInterestService.toggleInterest(gigId, username, interested);
        int interestCount = gigInterestService.getGigInterestCount(gigId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("interested", result);
        response.put("interestCount", interestCount);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{gigId}/interested-users")
    public ResponseEntity<List<UserInterestDTO>> getInterestedUsers(@PathVariable Long gigId) {
        List<UserInterestDTO> interestedUsers = gigInterestService.getInterestedUsersForGig(gigId);
        return ResponseEntity.ok(interestedUsers);
    }

    @GetMapping("/user-interests")
    public ResponseEntity<List<Long>> getUserInterests(@RequestParam String username) {
        List<Long> interestedGigIds = gigInterestService.getUserInterestedGigIds(username);
        return ResponseEntity.ok(interestedGigIds);
    }

    @PostMapping("/{gigId}/accept-interest")
    public ResponseEntity<?> acceptGigInterest(
            @PathVariable Long gigId,
            @RequestParam String username) {
        
        boolean result = gigInterestService.acceptInterest(gigId, username);
        
        if (!result) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Interest not found for this gig and user");
        }
        
        List<UserInterestDTO> allInterests = gigInterestService.getInterestedUsersForGig(gigId);
        for (UserInterestDTO interest : allInterests) {
            if (!interest.getUsername().equals(username) && !"rejected".equals(interest.getStatus())) {
                gigInterestService.rejectInterest(gigId, interest.getUsername());
            }
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("accepted", true);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{gigId}/reject-interest")
    public ResponseEntity<?> rejectGigInterest(
            @PathVariable Long gigId,
            @RequestParam String username) {
        
        boolean result = gigInterestService.rejectInterest(gigId, username);
        
        if (!result) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Interest not found for this gig and user");
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("rejected", true);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/accepted/{username}")
    public ResponseEntity<List<Gig>> getAcceptedGigs(@PathVariable String username) {
        List<Gig> acceptedGigs = gigInterestService.getAcceptedGigsForUser(username);
        return ResponseEntity.ok(acceptedGigs);
    }

    @GetMapping("/{gigId}/accepted-users")
    public ResponseEntity<List<Users>> getAcceptedUsersForGig(@PathVariable Long gigId) {
        List<Users> acceptedUsers = gigInterestService.getAcceptedUsersForGig(gigId);
        return ResponseEntity.ok(acceptedUsers);
    }
}
