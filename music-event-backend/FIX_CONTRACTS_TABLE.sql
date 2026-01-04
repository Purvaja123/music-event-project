-- Fix contracts table: Make event_id nullable and add missing columns
-- Run this in MySQL if you get the "event_id cannot be null" error

USE musicevent_db;

-- Step 1: Drop foreign key constraint temporarily (if it exists)
SET @constraint_name = (
    SELECT CONSTRAINT_NAME 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'musicevent_db' 
    AND TABLE_NAME = 'contracts' 
    AND COLUMN_NAME = 'event_id' 
    AND REFERENCED_TABLE_NAME IS NOT NULL
    LIMIT 1
);

SET @sql = IF(@constraint_name IS NOT NULL, 
    CONCAT('ALTER TABLE contracts DROP FOREIGN KEY ', @constraint_name), 
    'SELECT "No foreign key constraint found"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 2: Make event_id nullable
ALTER TABLE contracts MODIFY COLUMN event_id BIGINT NULL;

-- Step 3: Add missing columns (if they don't exist)
-- Note: MySQL doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN in older versions
-- So we'll check and add them one by one

-- Add venue column
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'musicevent_db' 
    AND TABLE_NAME = 'contracts' 
    AND COLUMN_NAME = 'venue'
);

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE contracts ADD COLUMN venue VARCHAR(255) AFTER event_name', 
    'SELECT "venue column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add event_date column
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'musicevent_db' 
    AND TABLE_NAME = 'contracts' 
    AND COLUMN_NAME = 'event_date'
);

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE contracts ADD COLUMN event_date VARCHAR(255) AFTER venue', 
    'SELECT "event_date column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add event_time column
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'musicevent_db' 
    AND TABLE_NAME = 'contracts' 
    AND COLUMN_NAME = 'event_time'
);

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE contracts ADD COLUMN event_time VARCHAR(255) AFTER event_date', 
    'SELECT "event_time column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add event_description column
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'musicevent_db' 
    AND TABLE_NAME = 'contracts' 
    AND COLUMN_NAME = 'event_description'
);

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE contracts ADD COLUMN event_description TEXT AFTER event_time', 
    'SELECT "event_description column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 4: Re-add foreign key constraint (optional, but recommended)
-- Note: Foreign key will allow NULL values since event_id is now nullable
ALTER TABLE contracts 
ADD CONSTRAINT fk_contracts_event 
FOREIGN KEY (event_id) REFERENCES events(id);

SELECT 'Contracts table fixed successfully!' AS Status;

