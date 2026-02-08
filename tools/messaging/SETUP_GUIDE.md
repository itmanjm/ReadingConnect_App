# Telegram Bot Setup Guide

> Instructions for setting up and running the Telegram messaging gateway.
> Bot name: AtlasMessagingBot (change as needed)

---

## Quick Start

### 0. Install Dependencies

**Option A - Install from requirements.txt** (recommended):
```bash
pip3 install -r tools/messaging/requirements.txt
```

**Option B - Install manually**:
```bash
pip3 install python-telegram-bot PyYAML
```

Verify installation:
```bash
pip3 list | grep -E "(telegram|yaml)"
```

### 1. Create Telegram Bot

1. **Go to https://t.me/BotFather** in Telegram
2. Start a chat with @BotFather: `/newbot`
3. Name your bot: `AtlasMessagingBot` (or your choice)
4. Get the bot token (starts with numbers:bot)
5. Copy the token

### 2. Add Token to Environment

Create or update `.env` file in your Atlas project root:

```bash
# Add Telegram bot token (REQUIRED)
echo "TELEGRAM_BOT_TOKEN=your_bot_token_here" >> .env
```

For AI-powered responses (OPTIONAL):

```bash
# Add OpenAI API key for intelligent responses
echo "OPENAI_API_KEY=sk-xxxxx" >> .env
```

### 3. Run the Gateway Daemon

Start the long-running daemon:

```bash
python3 tools/messaging/daemon.py
```

You should see:
```
INFO - Starting Telegram Gateway Daemon...
INFO - Checking database tables...
INFO - Starting Telegram bot...
INFO - Starting message polling...
INFO - Daemon started successfully!
```

### 4. Test the Bot

1. **Find your bot in Telegram**: Search for `@AtlasMessagingBot` (or your bot name)
2. **Start a chat**: Send `/start`
3. **Try commands**:
   - `/start` - Welcome message
   - `/help` - Show available commands
   - `/sessions` - List active sessions
   - `/stats` - Show conversation statistics
4. **Send a message**: Type anything and the bot will respond

### 5. Stop the Daemon

Press `Ctrl+C` to gracefully stop the daemon:
```
INFO - Received shutdown signal
INFO - Stopping daemon...
INFO - Daemon stopped.
```

---

## Quick Start

### 0. Install Dependencies

Before creating your bot, install the required Python packages:

```bash
pip3 install python-telegram-bot PyYAML
```

Verify installation:
```bash
pip3 list | grep -E "(telegram|yaml)"
```

### 1. Create Telegram Bot

1. **Go to https://t.me/BotFather** in Telegram
2. Start a chat with @BotFather: `/newbot`
3. Name your bot: `AtlasMessagingBot`
4. Get the bot token
5. Copy the token

### 2. Add Token to Environment

Create or update `.env` file in your Atlas project root:

```bash
# Add Telegram bot token
echo "TELEGRAM_BOT_TOKEN=your_bot_token_here" >> .env
```

If you want OpenAI integration for AI responses:

```bash
# Add OpenAI API key (optional)
echo "OPENAI_API_KEY=sk-xxxxx" >> .env
```

### 3. Test the Bot

```bash
# Start the bot
python tools/messaging/simple_bot.py --chat-id YOUR_CHAT_ID --message "Hello from Atlas bot!"
```

Replace `YOUR_CHAT_ID` with your actual Telegram user ID or a test chat.

### 4. Verify Bot Connection

Start a new chat with your bot in Telegram:
- Send a message
- Check if bot responds

---

## Configuration

The daemon uses `args/messaging.yaml` for configuration:

**Telegram Settings**:
- `bot_token`: From @BotFather (via TELEGRAM_BOT_TOKEN env var)
- `webhook_url`: Optional (we use long-polling)
- `allowed_users`: Empty = all users, or specific Telegram IDs
- `rate_limit`: 20 requests/minute, burst of 5

**OpenAI Settings** (optional):
- `api_key`: From OpenAI dashboard (via OPENAI_API_KEY env var)
- `model`: gpt-4o-mini (or your preferred model)
- `max_tokens`: 1000
- `context_entries`: 50 (number of memory entries to include)

**Logging**:
- `level`: debug, info, warn, or error
- `file`: `/tmp/messaging-gateway.log`

---

## Getting Your Chat ID

**Method 1 - Use @userinfobot**:
1. Start a chat with @userinfobot in Telegram
2. It will send you your numeric user ID
3. Use this ID for testing

**Method 2 - Check Telegram URL**:
1. Open Telegram web or app
2. Click on your profile
3. Copy the numeric ID from URL or profile info

---

## Troubleshooting

**Daemon won't start:**
```bash
# Check if dependencies are installed
pip3 list | grep -E "(telegram|yaml)"

# If missing, install them
pip3 install python-telegram-bot PyYAML
```

**Bot doesn't respond:**
- Verify bot token is correct in `.env`
- Check daemon is running (should see "Daemon started successfully!")
- Try sending `/start` command first
- Check logs: `tail -f /tmp/messaging-gateway.log`

**Module not found error:**
```bash
# Install missing dependencies
pip3 install python-telegram-bot PyYAML
```

**Permission denied errors:**
```bash
# Make scripts executable
chmod +x tools/messaging/*.py
```

**Bot responds but with "OpenAI not configured":**
- This is expected behavior without OPENAI_API_KEY
- Add to .env for AI responses:
  ```bash
  echo "OPENAI_API_KEY=sk-xxxxx" >> .env
  ```
- Restart daemon

**Rate limit warnings in logs:**
- Normal behavior when sending many messages
- Bot will continue working, just slows down temporarily
- Adjust `rate_limit` in `args/messaging.yaml` if needed

---

## Testing

### Run Automated Tests

After installing dependencies, run the test suite:

```bash
# Run all test scenarios
python3 tools/messaging/test_runner.py --all

# Run specific scenario
python3 tools/messaging/test_runner.py --scenario 1

# Verbose output
python3 tools/messaging/test_runner.py --all --verbose

# JSON output for CI/CD
python3 tools/messaging/test_runner.py --all --json
```

**Test Scenarios**:

1. **Basic Send/Receive** - Database connectivity and message storage
2. **Rate Limiting** - Token bucket implementation verification
3. **Session Management** - Create, update, list, close sessions
4. **Memory Integration** - MemoryIntegrator hooks verification
5. **Configuration** - YAML file validation
6. **Error Handling** - Exception handling and logging verification
7. **Multi-User** - Session isolation testing

**Test Status** (without bot):
- ✅ Scenario 3: Session Management - Full pass
- ⚠️ Scenarios 1, 2, 4, 5, 6, 7: Partial (code verified, needs bot for runtime)

**Test Status** (with bot running):
- Full runtime testing possible once bot token is provided

### Manual Testing

After starting the daemon, test manually:

1. **Basic Flow**:
   ```bash
   # Find your bot and send /start
   # Verify welcome message
   ```

2. **Session Management**:
   ```bash
   # Send /sessions
   # Verify your session appears
   # Send a message
   # Send /stats
   # Verify message count updated
   ```

3. **Rate Limiting**:
   ```bash
   # Send 6 messages rapidly
   # Messages 5-6 should be rate-limited
   # Wait, send message 7
   # Should deliver after cooldown
   ```

4. **Memory Integration**:
   ```bash
   # Check database for message storage
   sqlite3 data/memory.db "SELECT * FROM telegram_messages LIMIT 5"
   # Verify messages are stored
   ```

---

## Features

### Current Capabilities
- ✅ Send and receive messages via Telegram
- ✅ Session management (track chats, message counts)
- ✅ Command handlers (/start, /help, /sessions, /stats)
- ✅ Message storage in SQLite database
- ✅ Rate limiting (20 req/min, burst 5)
- ✅ Structured logging
- ✅ Graceful shutdown
- ⚠️ Memory integration (hook framework in place, full integration pending)

### Memory Integration (Planned)
- Auto-store incoming messages as 'event' entries
- Extract and store facts from conversations
- Load relevant context for AI responses
- Semantic search for conversation history

### Future Enhancements
- Message queue for workflow triggers
- Workflow execution tracking
- Interactive button commands
- Multi-language support
- Voice message transcription

---

## Architecture

```
Telegram API
     ↓
python-telegram-bot (async)
     ↓
Gateway Daemon (tools/messaging/daemon.py)
     ├→ Session Manager (database operations)
     ├→ Message Handlers (incoming/outgoing)
     ├→ Rate Limiter (token bucket)
     ├→ Configuration (args/messaging.yaml)
     ├→ Memory Integration (tools/memory/)
     └→ Logging (file + stdout)
     ↓
SQLite Database (data/memory.db)
     ├→ telegram_sessions (chats)
     ├→ telegram_messages (history)
     └→ memory_entries (context)
```

---

## Production Considerations

**For Production Use**:
1. Use systemd or supervisor to run daemon as service
2. Set up log rotation
3. Configure webhook mode (requires HTTPS)
4. Add monitoring/health checks
5. Backup SQLite database regularly
6. Use environment-specific configs (dev/staging/prod)

**Example systemd service**:
```ini
[Unit]
Description=Atlas Telegram Gateway
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/Atlas
ExecStart=/usr/bin/python3 /path/to/Atlas/tools/messaging/daemon.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

---

## Development

**Run in debug mode**:
```bash
# Edit args/messaging.yaml
telegram:
  logging:
    level: debug

# Run daemon
python3 tools/messaging/daemon.py
```

**Test database queries**:
```bash
# List sessions
python3 tools/messaging/telegram_client.py list

# Get message history
python3 tools/messaging/telegram_client.py history --chat-id YOUR_CHAT_ID

# Get statistics
python3 tools/messaging/telegram_client.py stats --chat-id YOUR_CHAT_ID
```

**View logs**:
```bash
# Follow logs in real-time
tail -f /tmp/messaging-gateway.log

# Search for errors
grep ERROR /tmp/messaging-gateway.log

# View recent activity
tail -100 /tmp/messaging-gateway.log
```

---

## Next Steps

1. ✅ Daemon is working (you just set it up!)
2. ⏳ Add OpenAI API key for intelligent responses
3. ⏳ Implement full memory integration
4. ⏳ Add workflow triggers for content/business automation
5. ⏳ Set up production deployment (systemd, monitoring)

---

*Last updated: 2026-02-04*

