package com.musicevent.repository;

import com.musicevent.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {
    List<Contract> findByArtistId(Long artistId);
    List<Contract> findByOrganizerId(Long organizerId);
    List<Contract> findByArtistIdAndStatus(Long artistId, Contract.ContractStatus status);
    List<Contract> findByOrganizerIdAndStatus(Long organizerId, Contract.ContractStatus status);
}







