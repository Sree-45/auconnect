package com.example.backend.service;

import com.example.backend.model.UserPaymentLink;
import com.example.backend.repository.UserPaymentLinkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserPaymentLinkService {

    private final UserPaymentLinkRepository paymentLinkRepository;

    @Autowired
    public UserPaymentLinkService(UserPaymentLinkRepository paymentLinkRepository) {
        this.paymentLinkRepository = paymentLinkRepository;
    }

    public UserPaymentLink savePaymentLink(UserPaymentLink paymentLink) {
        return paymentLinkRepository.save(paymentLink);
    }

    public Optional<UserPaymentLink> getPaymentLinkByUsername(String username) {
        return paymentLinkRepository.findByUsername(username);
    }

    public UserPaymentLink updatePaymentLink(String username, String paymentLink) {
        Optional<UserPaymentLink> existingLink = paymentLinkRepository.findByUsername(username);
        
        UserPaymentLink linkToSave;
        if (existingLink.isPresent()) {
            linkToSave = existingLink.get();
            linkToSave.setPaymentLink(paymentLink);
        } else {
            linkToSave = new UserPaymentLink();
            linkToSave.setUsername(username);
            linkToSave.setPaymentLink(paymentLink);
        }
        
        return paymentLinkRepository.save(linkToSave);
    }
}
