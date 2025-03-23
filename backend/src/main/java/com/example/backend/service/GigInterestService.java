package com.example.backend.service;

import com.example.backend.dto.UserInterestDTO;
import com.example.backend.model.Gig;
import com.example.backend.model.GigInterest;
import com.example.backend.model.Users;
import com.example.backend.repository.GigInterestRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class GigInterestService {
    
    private final GigInterestRepository gigInterestRepository;
    private final UserRepository userRepository;
    private final GigService gigService;
    
    @Autowired
    public GigInterestService(GigInterestRepository gigInterestRepository, UserRepository userRepository, @Lazy GigService gigService) {
        this.gigInterestRepository = gigInterestRepository;
        this.userRepository = userRepository;
        this.gigService = gigService;
    }
    
    @Transactional
    public boolean toggleInterest(Long gigId, String username, boolean isInterested) {
        GigInterest existingInterest = gigInterestRepository.findByGigIdAndUsername(gigId, username).orElse(null);
        
        if (isInterested) {
            if (existingInterest == null) {
                GigInterest interest = new GigInterest();
                interest.setGigId(gigId);
                interest.setUsername(username);
                interest.setCreatedDate(LocalDateTime.now());
                gigInterestRepository.save(interest);
            }
            return true;
        } else {
            if (existingInterest != null) {
                gigInterestRepository.delete(existingInterest);
            }
            return false;
        }
    }
    
    public List<Long> getUserInterestedGigIds(String username) {
        return gigInterestRepository.findGigIdsByUsername(username);
    }
    
    @Transactional
    public boolean acceptInterest(Long gigId, String username) {
        GigInterest interest = gigInterestRepository.findByGigIdAndUsername(gigId, username)
            .orElse(null);
        
        if (interest == null) {
            return false;
        }
        
        interest.setStatus("accepted");
        gigInterestRepository.save(interest);
        return true;
    }

    @Transactional
    public boolean rejectInterest(Long gigId, String username) {
        GigInterest interest = gigInterestRepository.findByGigIdAndUsername(gigId, username)
            .orElse(null);
        
        if (interest == null) {
            return false;
        }
        
        interest.setStatus("rejected");
        gigInterestRepository.save(interest);
        return true;
    }

    public List<UserInterestDTO> getInterestedUsersForGig(Long gigId) {
        List<GigInterest> interests = gigInterestRepository.findByGigId(gigId);
        List<UserInterestDTO> interestedUsers = new ArrayList<>();
        
        for (GigInterest interest : interests) {
            String username = interest.getUsername();
            Users user = userRepository.findByUsername(username);
            
            if (user != null) {
                UserInterestDTO dto = new UserInterestDTO();
                dto.setUsername(username);
                dto.setName(user.getFirstName() + " " + user.getLastName());
                dto.setProfilePhoto(user.getProfilePhoto());
                dto.setCreatedDate(interest.getCreatedDate());
                dto.setStatus(interest.getStatus());
                interestedUsers.add(dto);
            }
        }
        
        return interestedUsers;
    }
    
    public int getGigInterestCount(Long gigId) {
        return gigInterestRepository.countByGigId(gigId);
    }

    public List<Gig> getAcceptedGigsForUser(String username) {
        List<Long> acceptedGigIds = gigInterestRepository.findAcceptedGigIdsByUsername(username);
        List<Gig> gigs = new ArrayList<>();
        for (Long gigId : acceptedGigIds) {
            Gig gig = gigService.getGigById(gigId);
            if (gig != null) {
                gigService.enrichGigWithUserData(gig);
                gigs.add(gig);
            }
        }
        
        return gigs;
    }

    public List<Users> getAcceptedUsersForGig(Long gigId) {
        List<String> acceptedUsernames = gigInterestRepository.findAcceptedUsernamesByGigId(gigId);
        
        List<Users> acceptedUsers = new ArrayList<>();
        for (String username : acceptedUsernames) {
            Users user = userRepository.findByUsername(username);
            if (user != null) {
                acceptedUsers.add(user);
            }
        }
        
        return acceptedUsers;
    }

    public List<String> getAcceptedUsernamesForGig(Long gigId) {
        return gigInterestRepository.findAcceptedUsernamesByGigId(gigId);
    }
}
