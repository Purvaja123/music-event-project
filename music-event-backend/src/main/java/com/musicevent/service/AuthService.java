package com.musicevent.service;

import com.musicevent.dto.AuthResponse;
import com.musicevent.dto.LoginRequest;
import com.musicevent.dto.RegisterRequest;
import com.musicevent.entity.User;
import com.musicevent.repository.UserRepository;
import com.musicevent.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        // Create new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.valueOf(request.getRole().toUpperCase()));
        user.setProfile(request.getProfile());
        
        user = userRepository.save(user);
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        
        return new AuthResponse(
            token,
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole().name(),
            user.getProfile()
        );
    }
    
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid email or password"));
        
        // Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        
        return new AuthResponse(
            token,
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole().name(),
            user.getProfile()
        );
    }
}







