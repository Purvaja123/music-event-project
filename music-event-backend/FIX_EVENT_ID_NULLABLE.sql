-- Fix the event_id column to allow NULL values
-- Run this SQL script in your MySQL database

USE musicevent_db;

-- Alter the event_id column to allow NULL
ALTER TABLE contracts MODIFY COLUMN event_id BIGINT NULL;

