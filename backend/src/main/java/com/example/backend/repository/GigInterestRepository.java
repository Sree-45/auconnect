package com.example.backend.repository;

import com.example.backend.model.GigInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GigInterestRepository extends JpaRepository<GigInterest, Long> {
    
    Optional<GigInterest> findByGigIdAndUsername(Long gigId, String username);
    
    List<GigInterest> findByGigId(Long gigId);
    
    @Query("SELECT gi.gigId FROM GigInterest gi WHERE gi.username = ?1")
    List<Long> findGigIdsByUsername(String username);
    
    @Query("SELECT gi.gigId FROM GigInterest gi WHERE gi.username = ?1 AND gi.status = 'accepted'")
    List<Long> findAcceptedGigIdsByUsername(String username);
    
    void deleteByGigIdAndUsername(Long gigId, String username);
    
    int countByGigId(Long gigId);

    @Query("SELECT gi.username FROM GigInterest gi WHERE gi.gigId = ?1 AND gi.status = 'accepted'")
    List<String> findAcceptedUsernamesByGigId(Long gigId);
}
