-- Memory System Schema Migration
-- Adds missing columns to memory_entries table for compatibility with memory tools

-- Add source column
ALTER TABLE memory_entries ADD COLUMN source TEXT DEFAULT 'session';

-- Add is_active column
ALTER TABLE memory_entries ADD COLUMN is_active INTEGER DEFAULT 1;

-- Add embedding column (BLOB for vector storage)
ALTER TABLE memory_entries ADD COLUMN embedding BLOB;

-- Add expires_at column
ALTER TABLE memory_entries ADD COLUMN expires_at DATETIME;

-- Add tags column (JSON array)
ALTER TABLE memory_entries ADD COLUMN tags TEXT;

-- Add context column (for related entries)
ALTER TABLE memory_entries ADD COLUMN context TEXT;

-- Add session_id column
ALTER TABLE memory_entries ADD COLUMN session_id TEXT;

-- Create index for is_active
CREATE INDEX IF NOT EXISTS idx_memory_active_flag ON memory_entries(is_active);

-- Create index for session_id
CREATE INDEX IF NOT EXISTS idx_memory_session_id ON memory_entries(session_id);

-- Create index for expires_at
CREATE INDEX IF NOT EXISTS idx_memory_expires_at ON memory_entries(expires_at);

-- Create index for tags
CREATE INDEX IF NOT EXISTS idx_memory_tags ON memory_entries(tags);

-- Create index for context
CREATE INDEX IF NOT EXISTS idx_memory_context ON memory_entries(context);

-- Update entry_type to use proper values
-- 'fact', 'preference', 'note', 'insight', 'task', 'event', 'relationship'
-- Old values: 'fact', 'preference'
UPDATE memory_entries SET entry_type = 'note' WHERE entry_type = 'preference';
