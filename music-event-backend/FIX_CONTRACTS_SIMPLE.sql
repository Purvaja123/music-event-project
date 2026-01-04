-- Simple fix for contracts table - Make event_id nullable
-- Run this in MySQL command line or MySQL Workbench

USE musicevent_db;

-- Remove foreign key constraint first
ALTER TABLE contracts DROP FOREIGN KEY contracts_ibfk_3;

-- Make event_id nullable
ALTER TABLE contracts MODIFY COLUMN event_id BIGINT NULL;

-- Add missing columns
ALTER TABLE contracts 
ADD COLUMN IF NOT EXISTS venue VARCHAR(255) AFTER event_name,
ADD COLUMN IF NOT EXISTS event_date VARCHAR(255) AFTER venue,
ADD COLUMN IF NOT EXISTS event_time VARCHAR(255) AFTER event_date,
ADD COLUMN IF NOT EXISTS event_description TEXT AFTER event_time;

-- Re-add foreign key (allows NULL)
ALTER TABLE contracts 
ADD CONSTRAINT fk_contracts_event 
FOREIGN KEY (event_id) REFERENCES events(id);

