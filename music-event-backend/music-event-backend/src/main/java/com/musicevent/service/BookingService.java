package com.musicevent.service;

import com.musicevent.entity.Booking;
import com.musicevent.entity.Event;
import com.musicevent.repository.BookingRepository;
import com.musicevent.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private EventRepository eventRepository;
    
    public Booking createBooking(Booking booking) {
        // Check event availability
        Event event = eventRepository.findById(booking.getEventId())
            .orElseThrow(() -> new RuntimeException("Event not found"));
        
        if (event.getAvailableTickets() < booking.getTickets()) {
            throw new RuntimeException("Not enough tickets available");
        }
        
        // Generate QR code
        booking.setQrCode("QR-" + UUID.randomUUID().toString() + "-" + booking.getEventId());
        
        // Save booking
        Booking savedBooking = bookingRepository.save(booking);
        
        // Update event tickets
        event.setAvailableTickets(event.getAvailableTickets() - booking.getTickets());
        eventRepository.save(event);
        
        return savedBooking;
    }
    
    public List<Booking> getUserBookings(Long userId) {
        return bookingRepository.findByUserId(userId);
    }
    
    public List<Booking> getEventBookings(Long eventId) {
        return bookingRepository.findByEventId(eventId);
    }
    
    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }
}

