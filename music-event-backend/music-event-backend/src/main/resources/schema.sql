-- Database Schema for Music Event Management System

-- Create database (run this first)
CREATE DATABASE IF NOT EXISTS musicevent_db;
USE musicevent_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('USER', 'ORGANIZER', 'MUSICIAN') NOT NULL,
    profile TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(50) NOT NULL,
    price DOUBLE NOT NULL,
    category VARCHAR(100) NOT NULL,
    emoji VARCHAR(10),
    total_tickets INT NOT NULL,
    available_tickets INT NOT NULL,
    status ENUM('UPCOMING', 'COMPLETED', 'CANCELLED') DEFAULT 'UPCOMING',
    organizer_id BIGINT NOT NULL,
    organizer_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    event_id BIGINT NOT NULL,
    tickets INT NOT NULL,
    qr_code VARCHAR(255) NOT NULL UNIQUE,
    status ENUM('CONFIRMED', 'CANCELLED', 'REFUNDED') DEFAULT 'CONFIRMED',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES events(id)
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organizer_id BIGINT NOT NULL,
    organizer_name VARCHAR(255) NOT NULL,
    artist_id BIGINT NOT NULL,
    artist_name VARCHAR(255) NOT NULL,
    event_id BIGINT NULL,
    event_name VARCHAR(255) NOT NULL,
    venue VARCHAR(255),
    event_date VARCHAR(255),
    event_time VARCHAR(255),
    event_description TEXT,
    payment_amount DOUBLE NOT NULL,
    notes TEXT,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (organizer_id) REFERENCES users(id),
    FOREIGN KEY (artist_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES events(id)
);

-- Create indexes for better performance
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_role ON users(role);
CREATE INDEX idx_event_organizer ON events(organizer_id);
CREATE INDEX idx_event_status ON events(status);
CREATE INDEX idx_booking_user ON bookings(user_id);
CREATE INDEX idx_booking_event ON bookings(event_id);
CREATE INDEX idx_contract_artist ON contracts(artist_id);
CREATE INDEX idx_contract_organizer ON contracts(organizer_id);







