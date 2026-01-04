package com.musicevent.controller;

import com.musicevent.entity.Contract;
import com.musicevent.service.ContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contracts")
@CrossOrigin(origins = "http://localhost:3000")
public class ContractController {
    @Autowired
    private ContractService contractService;
    
    @PostMapping
    public ResponseEntity<Contract> createContract(@RequestBody Contract contract) {
        return ResponseEntity.ok(contractService.createContract(contract));
    }
    
    @GetMapping("/artist/{artistId}")
    public ResponseEntity<List<Contract>> getArtistContracts(@PathVariable Long artistId) {
        return ResponseEntity.ok(contractService.getArtistContracts(artistId));
    }
    
    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<List<Contract>> getOrganizerContracts(@PathVariable Long organizerId) {
        return ResponseEntity.ok(contractService.getOrganizerContracts(organizerId));
    }
    
    @GetMapping("/artist/{artistId}/pending")
    public ResponseEntity<List<Contract>> getPendingContracts(@PathVariable Long artistId) {
        return ResponseEntity.ok(contractService.getPendingContractsForArtist(artistId));
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<Contract> updateContractStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        Contract.ContractStatus status = Contract.ContractStatus.valueOf(
            request.get("status").toUpperCase()
        );
        return ResponseEntity.ok(contractService.updateContractStatus(id, status));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Contract> getContractById(@PathVariable Long id) {
        return contractService.getContractById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/link-event")
    public ResponseEntity<Contract> linkEventToContract(
            @PathVariable Long id,
            @RequestBody Map<String, Long> request) {
        Long eventId = request.get("eventId");
        return ResponseEntity.ok(contractService.linkEventToContract(id, eventId));
    }
}







