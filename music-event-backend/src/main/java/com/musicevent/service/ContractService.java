package com.musicevent.service;

import com.musicevent.entity.Contract;
import com.musicevent.entity.Event;
import com.musicevent.repository.ContractRepository;
import com.musicevent.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ContractService {
    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private EventRepository eventRepository;
    
    public Contract createContract(Contract contract) {
        return contractRepository.save(contract);
    }
    
    public List<Contract> getArtistContracts(Long artistId) {
        return contractRepository.findByArtistId(artistId);
    }
    
    public List<Contract> getOrganizerContracts(Long organizerId) {
        return contractRepository.findByOrganizerId(organizerId);
    }
    
    public List<Contract> getPendingContractsForArtist(Long artistId) {
        return contractRepository.findByArtistIdAndStatus(
            artistId, Contract.ContractStatus.PENDING
        );
    }
    
    public Contract updateContractStatus(Long id, Contract.ContractStatus status) {
        Contract contract = contractRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Contract not found"));

        contract.setStatus(status);

        // Note: Event will be created after contract acceptance, not before
        // The event will be linked to the contract when it's created

        return contractRepository.save(contract);
    }

    public Contract linkEventToContract(Long contractId, Long eventId) {
        Contract contract = contractRepository.findById(contractId)
            .orElseThrow(() -> new RuntimeException("Contract not found"));
        
        contract.setEventId(eventId);
        return contractRepository.save(contract);
    }
    
    public Optional<Contract> getContractById(Long id) {
        return contractRepository.findById(id);
    }
}







