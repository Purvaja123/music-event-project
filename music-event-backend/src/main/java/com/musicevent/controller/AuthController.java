package com.musicevent.controller;

import com.musicevent.dto.AuthResponse;
import com.musicevent.dto.LoginRequest;
import com.musicevent.dto.RegisterRequest;
import com.musicevent.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    @Autowired
    private AuthService authService;
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                new ErrorResponse(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                new ErrorResponse("Registration failed: " + e.getMessage())
            );
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                new ErrorResponse(e.getMessage())
            );
        }
    }
    
    // Exception handler for validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex) {
        StringBuilder errors = new StringBuilder();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            if (errors.length() > 0) {
                errors.append(", ");
            }
            errors.append(fieldName).append(": ").append(errorMessage);
        });
        return ResponseEntity.badRequest().body(
            new ErrorResponse("Validation failed: " + errors.toString())
        );
    }
    
    // Inner class for error response
    private static class ErrorResponse {
        private String error;
        
        public ErrorResponse(String error) {
            this.error = error;
        }
        
        public String getError() {
            return error;
        }
    }
}







