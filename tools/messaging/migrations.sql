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
    content TEXT NOT NULL,
    content_type TEXT,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES telegram_sessions(id) ON DELETE CASCADE
);

-- Webhook events
CREATE TABLE IF NOT EXISTS telegram_webhooks (
    id INTEGER PRIMARY KEY,
    event_type TEXT NOT NULL,
    payload TEXT,
    processed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_telegram_sessions_chat ON telegram_sessions(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_session ON telegram_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_created ON telegram_messages(created_at);
