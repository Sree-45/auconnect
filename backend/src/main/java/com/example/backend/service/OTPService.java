package com.example.backend.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class OTPService {
    
    private final Map<String, OTPData> otpMap = new ConcurrentHashMap<>();
    
    private static final long OTP_EXPIRY_MINUTES = 10;
    
    public String generateOTP(String email) {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        String otpString = String.valueOf(otp);
        
        otpMap.put(email, new OTPData(otpString, System.currentTimeMillis()));
        
        return otpString;
    }
    
    public boolean validateOTP(String email, String otp) {
        OTPData otpData = otpMap.get(email);
        
        if (otpData == null) {
            return false;
        }
        
        long currentTime = System.currentTimeMillis();
        if (currentTime - otpData.getTimestamp() > TimeUnit.MINUTES.toMillis(OTP_EXPIRY_MINUTES)) {
            otpMap.remove(email);
            return false;
        }
        
        boolean isValid = otpData.getOtp().equals(otp);
        
        if (isValid) {
            otpMap.remove(email);
        }
        
        return isValid;
    }
    
    private static class OTPData {
        private final String otp;
        private final long timestamp;
        
        public OTPData(String otp, long timestamp) {
            this.otp = otp;
            this.timestamp = timestamp;
        }
        
        public String getOtp() {
            return otp;
        }
        
        public long getTimestamp() {
            return timestamp;
        }
    }
}
