package com.musicevent.controller;

import com.musicevent.entity.User;
import com.musicevent.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "https://music-event-project.vercel.app"
})

public class UserController {
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping("/artists")
    public ResponseEntity<List<User>> getArtists() {
        return ResponseEntity.ok(userRepository.findByRole(User.Role.MUSICIAN));
    }
    
    @GetMapping("/organizers")
    public ResponseEntity<List<User>> getOrganizers() {
        return ResponseEntity.ok(userRepository.findByRole(User.Role.ORGANIZER));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
            .map(user -> {
                // Remove password before sending
                user.setPassword(null);
                return ResponseEntity.ok(user);
            })
            .orElse(ResponseEntity.notFound().build());
    }
}







