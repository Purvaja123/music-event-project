package com.musicevent.service;

import com.musicevent.entity.Event;
import com.musicevent.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class EventService {
    @Autowired
    private EventRepository eventRepository;
    
    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }
    
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }
    
    public List<Event> getUpcomingEvents() {
        LocalDate today = LocalDate.now();
        return eventRepository.findByStatusAndDateGreaterThanEqual(
            Event.EventStatus.UPCOMING, today
        );
    }
    
    public List<Event> getOrganizerEvents(Long organizerId) {
        return eventRepository.findByOrganizerId(organizerId);
    }
    
    public Optional<Event> getEventById(Long id) {
        return eventRepository.findById(id);
    }
    
    public Event updateEvent(Long id, Event eventDetails) {
        Event event = eventRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Event not found"));
        
        event.setName(eventDetails.getName());
        event.setDescription(eventDetails.getDescription());
        event.setLocation(eventDetails.getLocation());
        event.setDate(eventDetails.getDate());
        event.setTime(eventDetails.getTime());
        event.setPrice(eventDetails.getPrice());
        event.setCategory(eventDetails.getCategory());
        event.setTotalTickets(eventDetails.getTotalTickets());
        event.setAvailableTickets(eventDetails.getAvailableTickets());
        event.setStatus(eventDetails.getStatus());
        event.setMusicianId(eventDetails.getMusicianId());
        event.setMusicianName(eventDetails.getMusicianName());
        
        return eventRepository.save(event);
    }
    
    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }
}







