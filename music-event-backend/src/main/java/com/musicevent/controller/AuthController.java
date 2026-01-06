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

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;

// @RestController
// @RequestMapping("/auth")
// @CrossOrigin(origins = "http://localhost:3000")
// public class AuthController {
@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {
    @Autowired
    private AuthService authService;

    // Path for NDJSON debugging (relative so it works both locally and on Render)
    private static final Path DEBUG_LOG_PATH = Path.of(".cursor", "debug.log");

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        // #region agent log
        try {
            Files.createDirectories(DEBUG_LOG_PATH.getParent());
            String logEntry = "{\"sessionId\":\"debug-session\",\"runId\":\"initial\",\"hypothesisId\":\"H1\",\"location\":\"AuthController.java:register\",\"message\":\"enter register\",\"data\":{\"email\":\""
                    + (request != null ? request.getEmail() : "null")
                    + "\"},\"timestamp\":" + System.currentTimeMillis() + "}";
            Files.writeString(
                    DEBUG_LOG_PATH,
                    logEntry + System.lineSeparator(),
                    StandardOpenOption.CREATE, StandardOpenOption.APPEND
            );
        } catch (Exception ignored) {}
        // #endregion
        try {
            AuthResponse response = authService.register(request);
            // #region agent log
            try {
                Files.createDirectories(DEBUG_LOG_PATH.getParent());
                String logEntry = "{\"sessionId\":\"debug-session\",\"runId\":\"initial\",\"hypothesisId\":\"H2\",\"location\":\"AuthController.java:register\",\"message\":\"register success\",\"data\":{\"userId\":"
                        + (response != null ? response.getId() : -1)
                        + "},\"timestamp\":" + System.currentTimeMillis() + "}";
                Files.writeString(
                        DEBUG_LOG_PATH,
                        logEntry + System.lineSeparator(),
                        StandardOpenOption.CREATE, StandardOpenOption.APPEND
                );
            } catch (Exception ignored) {}
            // #endregion
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // #region agent log
            try {
                Files.createDirectories(DEBUG_LOG_PATH.getParent());
                String logEntry = "{\"sessionId\":\"debug-session\",\"runId\":\"initial\",\"hypothesisId\":\"H3\",\"location\":\"AuthController.java:register\",\"message\":\"register runtime exception\",\"data\":{\"error\":\""
                        + e.getMessage().replace("\"", "'")
                        + "\"},\"timestamp\":" + System.currentTimeMillis() + "}";
                Files.writeString(
                        DEBUG_LOG_PATH,
                        logEntry + System.lineSeparator(),
                        StandardOpenOption.CREATE, StandardOpenOption.APPEND
                );
            } catch (Exception ignored) {}
            // #endregion
            return ResponseEntity.badRequest().body(
                new ErrorResponse(e.getMessage())
            );
        } catch (Exception e) {
            // #region agent log
            try {
                Files.createDirectories(DEBUG_LOG_PATH.getParent());
                String logEntry = "{\"sessionId\":\"debug-session\",\"runId\":\"initial\",\"hypothesisId\":\"H4\",\"location\":\"AuthController.java:register\",\"message\":\"register general exception\",\"data\":{\"error\":\""
                        + e.getMessage().replace("\"", "'")
                        + "\"},\"timestamp\":" + System.currentTimeMillis() + "}";
                Files.writeString(
                        DEBUG_LOG_PATH,
                        logEntry + System.lineSeparator(),
                        StandardOpenOption.CREATE, StandardOpenOption.APPEND
                );
            } catch (Exception ignored) {}
            // #endregion
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







