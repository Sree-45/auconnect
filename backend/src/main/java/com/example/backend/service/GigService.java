package com.example.backend.service;

import com.example.backend.model.Gig;
import com.example.backend.model.Users;
import com.example.backend.repository.GigRepository;
import com.example.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class GigService {

    @Autowired
    private GigRepository gigRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private GigInterestService gigInterestService;
    
    public List<Gig> getAllGigs() {
        return gigRepository.findByOrderByCreatedAtDesc();
    }
    
    public List<Gig> getGigsByUsername(String username) {
        return gigRepository.findByUsername(username);
    }
    
    public List<Gig> getGigsByCategory(String category) {
        return gigRepository.findByCategory(category);
    }
    
    public List<Gig> searchGigs(String searchTerm) {
        return gigRepository.findByTitleContainingOrDescriptionContainingOrderByCreatedAtDesc(searchTerm, searchTerm);
    }
    
    public Gig getGigById(Long id) {
        Optional<Gig> gig = gigRepository.findById(id);
        return gig.orElse(null);
    }
    
    public Gig createGig(Gig gig) {
        return gigRepository.save(gig);
    }
    
    public Gig updateGig(Long id, Gig gigDetails) {
        Optional<Gig> optionalGig = gigRepository.findById(id);
        
        if (optionalGig.isPresent()) {
            Gig gig = optionalGig.get();
            gig.setTitle(gigDetails.getTitle());
            gig.setDescription(gigDetails.getDescription());
            gig.setCategory(gigDetails.getCategory());
            gig.setPrice(gigDetails.getPrice());
            gig.setLocation(gigDetails.getLocation());
            gig.setDuration(gigDetails.getDuration());
            gig.setStatus(gigDetails.getStatus());
            
            return gigRepository.save(gig);
        }
        
        return null;
    }
    
    public boolean deleteGig(Long id) {
        Optional<Gig> gig = gigRepository.findById(id);
        
        if (gig.isPresent()) {
            gigRepository.deleteById(id);
            return true;
        }
        
        return false;
    }
    
    public Gig incrementViews(Long id) {
        Optional<Gig> optionalGig = gigRepository.findById(id);
        
        if (optionalGig.isPresent()) {
            Gig gig = optionalGig.get();
            gig.setViews(gig.getViews() + 1);
            return gigRepository.save(gig);
        }
        
        return null;
    }
    
    public Gig incrementResponses(Long id) {
        Optional<Gig> optionalGig = gigRepository.findById(id);
        
        if (optionalGig.isPresent()) {
            Gig gig = optionalGig.get();
            gig.setResponses(gig.getResponses() + 1);
            return gigRepository.save(gig);
        }
        
        return null;
    }
    
    public void enrichGigsWithUserData(List<Gig> gigs) {
        for (Gig gig : gigs) {
            enrichGigWithUserData(gig);
        }
    }

    public void enrichGigWithUserData(Gig gig) {
        Users user = userRepository.findByUsername(gig.getUsername());
        
        if (user != null) {
            gig.setUserFullName(user.getFirstName() + " " + user.getLastName());
            gig.setUserProfilePhoto(user.getProfilePhoto());
        }
    }

    public List<Gig> getCompletedGigsForUser(String username) {
        List<Gig> userGigs = gigRepository.findByUsername(username);
        List<Gig> acceptedGigs = gigInterestService.getAcceptedGigsForUser(username);
        
        List<Gig> allUserGigs = new ArrayList<>();
        allUserGigs.addAll(userGigs);
        allUserGigs.addAll(acceptedGigs);
        
        // Filter to only completed gigs
        return allUserGigs.stream()
            .filter(gig -> "Completed".equals(gig.getStatus()))
            .collect(Collectors.toList());
    }
}
