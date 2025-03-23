package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.model.Connection;
import com.example.backend.model.Users;
import com.example.backend.repository.ConnectionRepository;
import com.example.backend.repository.UserRepository;

@Service
public class ConnectionService {

    @Autowired
    private ConnectionRepository connectionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public Connection createConnectionRequest(String fromUsername, String toUsername) {
        Optional<Connection> existingConnection = 
            connectionRepository.findByFromUsernameAndToUsername(fromUsername, toUsername);
        
        if (existingConnection.isPresent()) {
            Connection connection = existingConnection.get();
            if (connection.getStatus().equals("rejected")) {
                connection.setStatus("pending");
                connection.setRequestDate(LocalDateTime.now());
                connection.setResponseDate(null);
                return connectionRepository.save(connection);
            }
            return connection;
        }
        
        Connection connection = new Connection(fromUsername, toUsername);
        return connectionRepository.save(connection);
    }
    
    public Map<String, String> getConnectionStatus(String fromUsername, String toUsername) {
        Map<String, String> result = new HashMap<>();
        
        Optional<Connection> fromToConnection = 
            connectionRepository.findByFromUsernameAndToUsername(fromUsername, toUsername);
            
        if (fromToConnection.isPresent()) {
            Connection connection = fromToConnection.get();
            result.put("status", connection.getStatus());
            return result;
        }
        
        Optional<Connection> toFromConnection = 
            connectionRepository.findByFromUsernameAndToUsername(toUsername, fromUsername);
            
        if (toFromConnection.isPresent()) {
            Connection connection = toFromConnection.get();
            if (connection.getStatus().equals("connected")) {
                result.put("status", "connected");
            } else if (connection.getStatus().equals("pending")) {
                result.put("status", "received_request");
            } else {
                result.put("status", "not_connected");
            }
            return result;
        }
        
        result.put("status", "not_connected");
        return result;
    }
    
    public Connection acceptConnectionRequest(String fromUsername, String toUsername) {
        Optional<Connection> connectionOpt = 
            connectionRepository.findByFromUsernameAndToUsername(fromUsername, toUsername);
        
        if (connectionOpt.isPresent()) {
            Connection connection = connectionOpt.get();
            connection.setStatus("connected");
            connection.setResponseDate(LocalDateTime.now());
            return connectionRepository.save(connection);
        }
        
        throw new RuntimeException("Connection request not found");
    }
    
    public Connection rejectConnectionRequest(String fromUsername, String toUsername) {
        Optional<Connection> connectionOpt = 
            connectionRepository.findByFromUsernameAndToUsername(fromUsername, toUsername);
        
        if (connectionOpt.isPresent()) {
            Connection connection = connectionOpt.get();
            connection.setStatus("rejected");
            connection.setResponseDate(LocalDateTime.now());
            return connectionRepository.save(connection);
        }
        
        throw new RuntimeException("Connection request not found");
    }
    
    public void disconnectUsers(String fromUsername, String toUsername) {
        connectionRepository.findByFromUsernameAndToUsername(fromUsername, toUsername)
            .ifPresent(connectionRepository::delete);
        
        connectionRepository.findByFromUsernameAndToUsername(toUsername, fromUsername)
            .ifPresent(connectionRepository::delete);
    }
    
    public List<Map<String, Object>> getPendingRequestsForUser(String username) {
        List<Connection> pendingConnections = 
            connectionRepository.findByToUsernameAndStatus(username, "pending");
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (Connection connection : pendingConnections) {
            Users requestingUser = userRepository.findByUsername(connection.getFromUsername());
            if (requestingUser != null) {
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("username", requestingUser.getUsername());
                userInfo.put("firstName", requestingUser.getFirstName());
                userInfo.put("lastName", requestingUser.getLastName());
                userInfo.put("profilePhoto", requestingUser.getProfilePhoto());
                result.add(userInfo);
            }
        }
        
        return result;
    }

    public List<Map<String, Object>> getUserConnections(String username) {
        List<Connection> userConnections = 
            connectionRepository.findAllConnectionsForUser(username);
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (Connection connection : userConnections) {
            String connectedUsername = connection.getFromUsername().equals(username) ? 
                                      connection.getToUsername() : connection.getFromUsername();
            
            Users connectedUser = userRepository.findByUsername(connectedUsername);
            if (connectedUser != null) {
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("username", connectedUser.getUsername());
                userInfo.put("firstName", connectedUser.getFirstName());
                userInfo.put("lastName", connectedUser.getLastName());
                userInfo.put("profilePhoto", connectedUser.getProfilePhoto());
                result.add(userInfo);
            }
        }
        
        return result;
    }
}
