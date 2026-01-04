package com.musicevent.repository;

import com.musicevent.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByOrganizerId(Long organizerId);
    List<Event> findByStatusAndDateGreaterThanEqual(Event.EventStatus status, LocalDate date);
    List<Event> findByStatus(Event.EventStatus status);
}







