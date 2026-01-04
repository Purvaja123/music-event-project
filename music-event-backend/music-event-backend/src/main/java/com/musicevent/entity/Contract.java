package com.musicevent.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "contracts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Contract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long organizerId;
    
    @Column(nullable = false)
    private String organizerName;
    
    @Column(nullable = false)
    private Long artistId;
    
    @Column(nullable = false)
    private String artistName;
    
    @Column(nullable = true, columnDefinition = "BIGINT")
    private Long eventId; // Nullable - event doesn't exist until contract is accepted
    
    @Column(nullable = false)
    private String eventName;
    
    private String venue;
    
    private String eventDate;
    
    private String eventTime;
    
    @Column(columnDefinition = "TEXT")
    private String eventDescription;
    
    @Column(nullable = false)
    private Double paymentAmount;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ContractStatus status;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = ContractStatus.PENDING;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum ContractStatus {
        PENDING, ACCEPTED, REJECTED
    }
}







