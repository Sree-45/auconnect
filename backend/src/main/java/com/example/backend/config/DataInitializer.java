package com.example.backend.config;

import com.example.backend.model.Users;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.logging.Logger;

@Component
public class DataInitializer implements CommandLineRunner {
    
    private static final Logger log = Logger.getLogger(DataInitializer.class.getName());
    
    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if university account exists
        Users universityUser = userRepository.findByUsername("anurag_university");
        
        if (universityUser == null) {
            log.info("University account not found. Creating default account...");
            
            universityUser = new Users();
            universityUser.setUsername("anurag_university");
            universityUser.setPassword("Admin@123");
            universityUser.setFirstName("Anurag");
            universityUser.setLastName("University");
            universityUser.setEmail("admissionsic@anurag.edu.in");
            universityUser.setLocation("Hyderabad, Telangana");
            
            // Save the university account
            userRepository.save(universityUser);
            
            log.info("Successfully created university account: anurag_university");
        } else {
            log.info("University account already exists");
        }
    }
}
