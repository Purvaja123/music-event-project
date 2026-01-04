-- Fix contracts table to make event_id nullable and add missing columns
-- Run this script if the contracts table already exists

USE musicevent_db;

-- Make event_id nullable
ALTER TABLE contracts MODIFY COLUMN event_id BIGINT NULL;

-- Add missing columns if they don't exist
ALTER TABLE contracts 
ADD COLUMN IF NOT EXISTS venue VARCHAR(255) AFTER event_name,
ADD COLUMN IF NOT EXISTS event_date VARCHAR(255) AFTER venue,
ADD COLUMN IF NOT EXISTS event_time VARCHAR(255) AFTER event_date,
ADD COLUMN IF NOT EXISTS event_description TEXT AFTER event_time;

