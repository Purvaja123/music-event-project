package com.musicevent.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private String location;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(nullable = false)
    private String time;
    
    @Column(nullable = false)
    private Double price;
    
    @Column(nullable = false)
    private String category;
    
    private String emoji;
    
    @Column(nullable = false)
    private Integer totalTickets;
    
    @Column(nullable = false)
    private Integer availableTickets;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EventStatus status;
    
    @Column(nullable = false)
    private Long organizerId;
    
    @Column(nullable = false)
    private String organizerName;

    private Long musicianId;

    private String musicianName;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = EventStatus.UPCOMING;
        }
    }
    
    public enum EventStatus {
        UPCOMING, COMPLETED, CANCELLED
    }
}







