package com.example.backend.controller;

import com.example.backend.model.UserPaymentLink;
import com.example.backend.service.UserPaymentLinkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payment-links")
public class UserPaymentLinkController {

    private final UserPaymentLinkService paymentLinkService;

    @Autowired
    public UserPaymentLinkController(UserPaymentLinkService paymentLinkService) {
        this.paymentLinkService = paymentLinkService;
    }

    @GetMapping("/{username}")
    public ResponseEntity<?> getPaymentLink(@PathVariable String username) {
        Optional<UserPaymentLink> paymentLink = paymentLinkService.getPaymentLinkByUsername(username);
        
        if (paymentLink.isPresent()) {
            return ResponseEntity.ok(paymentLink.get());
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("message", "No payment link found for this user");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<UserPaymentLink> createOrUpdatePaymentLink(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String paymentLink = request.get("paymentLink");
        
        if (username == null || paymentLink == null) {
            return ResponseEntity.badRequest().build();
        }
        
        UserPaymentLink saved = paymentLinkService.updatePaymentLink(username, paymentLink);
        return ResponseEntity.ok(saved);
    }
}
