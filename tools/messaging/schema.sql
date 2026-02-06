-- Database Migrations: Telegram Messaging

-- SQLite schema for Telegram gateway sessions, messages, and webhooks.
-- Use: sqlite3 data/memory.db < tools/messaging/schema.sql

-- Telegram sessions (tracks active chats)
CREATE TABLE IF NOT EXISTS telegram_sessions (
    id INTEGER PRIMARY KEY,
    telegram_chat_id TEXT UNIQUE NOT NULL,
    telegram_user_id INTEGER NOT NULL,
    title TEXT,
    message_count INTEGER DEFAULT 0,
    last_message_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Message history
CREATE TABLE IF NOT EXISTS telegram_messages (
    id INTEGER PRIMARY KEY,
    session_id INTEGER NOT NULL,
    message_id INTEGER NOT NULL,
    direction TEXT CHECK(direction IN ('incoming', 'outgoing')),
    content TEXT,
    content_type TEXT DEFAULT 'text',
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES telegram_sessions(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_telegram_sessions_chat ON telegram_sessions(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_session ON telegram_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_created ON telegram_messages(created_at);

-- Build sessions (tracks active builds)
CREATE TABLE IF NOT EXISTS build_sessions (
    id INTEGER PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    goal_name TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    chat_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'running', 'completed', 'failed', 'killed')),
    current_step TEXT,
    progress INTEGER DEFAULT 0,
    pid INTEGER,
    output TEXT,
    error_message TEXT,
    project_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
);

-- Build output lines (for streaming)
CREATE TABLE IF NOT EXISTS build_output (
    id INTEGER PRIMARY KEY,
    session_id TEXT NOT NULL,
    line_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_error BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES build_sessions(session_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_build_sessions_session ON build_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_build_sessions_user ON build_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_build_output_session ON build_output(session_id);

-- Cron Jobs Table (scheduled tasks)
CREATE TABLE IF NOT EXISTS cron_jobs (
    id INTEGER PRIMARY KEY,
    job_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    command TEXT NOT NULL,
    schedule TEXT NOT NULL,
    job_type TEXT DEFAULT 'shell',
    goal_name TEXT,
    args TEXT,
    user_id INTEGER NOT NULL,
    chat_id TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'paused', 'deleted')),
    last_run_at DATETIME,
    next_run_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cron Job History (execution logs)
CREATE TABLE IF NOT EXISTS cron_job_history (
    id INTEGER PRIMARY KEY,
    job_id TEXT NOT NULL,
    run_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('running', 'success', 'failed', 'timeout')),
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    duration_seconds REAL,
    output TEXT,
    error_message TEXT,
    exit_code INTEGER
);

-- Cron Job Notifications (sent to Telegram)
CREATE TABLE IF NOT EXISTS cron_notifications (
    id INTEGER PRIMARY KEY,
    job_id TEXT NOT NULL,
    run_id TEXT NOT NULL,
    message TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cron_jobs_id ON cron_jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_status ON cron_jobs(status);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_next ON cron_jobs(next_run_at);
CREATE INDEX IF NOT EXISTS idx_cron_history_job ON cron_job_history(job_id);
CREATE INDEX IF NOT EXISTS idx_cron_history_run ON cron_job_history(run_id);

-- Skill Executions (audit log)
CREATE TABLE IF NOT EXISTS skill_executions (
    id INTEGER PRIMARY KEY,
    execution_id TEXT UNIQUE NOT NULL,
    skill_id TEXT NOT NULL,
    parameters TEXT,
    success BOOLEAN,
    response TEXT,
    error TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_skill_exec_skill ON skill_executions(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_exec_time ON skill_executions(started_at);

-- Conversation Threads (for maintaining context across messages)
CREATE TABLE IF NOT EXISTS conversation_threads (
    id INTEGER PRIMARY KEY,
    thread_id TEXT UNIQUE NOT NULL,
    chat_id TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    topic TEXT,
    context_data TEXT,  -- JSON: last skill used, pending actions, etc.
    last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Thread Messages (link messages to threads)
CREATE TABLE IF NOT EXISTS thread_messages (
    id INTEGER PRIMARY KEY,
    thread_id TEXT NOT NULL,
    message_id INTEGER NOT NULL,
    reply_to_message_id INTEGER,
    content TEXT,
    direction TEXT CHECK(direction IN ('incoming', 'outgoing')),
    skill_used TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES conversation_threads(thread_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_threads_chat ON conversation_threads(chat_id);
CREATE INDEX IF NOT EXISTS idx_threads_active ON conversation_threads(is_active);
CREATE INDEX IF NOT EXISTS idx_thread_msgs_thread ON thread_messages(thread_id);
