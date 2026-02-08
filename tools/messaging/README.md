# Telegram Messaging Gateway

> Long-running async Telegram bot that integrates with Atlas/GOTCHA framework.

## Quick Start

1. Install dependencies:
   ```bash
   pip3 install -r requirements.txt
   ```

2. Create Telegram bot:
   - Go to https://t.me/BotFather
   - Send `/newbot`
   - Name it `AtlasMessagingBot`
   - Copy the bot token

3. Add to environment:
   ```bash
   echo "TELEGRAM_BOT_TOKEN=your_token_here" >> .env
   ```

4. Run daemon:
   ```bash
   python3 daemon.py
   ```

5. Find bot in Telegram and send `/start`

## Files

- `daemon.py` - Main async daemon (735 lines)
- `telegram_client.py` - CLI tool for operations
- `simple_bot.py` - Simple bot for testing
- `database.py` - SQL migrations
- `requirements.txt` - Python dependencies
- `SETUP_GUIDE.md` - Comprehensive setup and troubleshooting

## Commands

- `/start` - Welcome message
- `/help` - Show available commands
- `/sessions` - List active sessions
- `/stats` - Session statistics

## CLI Tool Usage

```bash
# List sessions
python3 telegram_client.py list

# Get message history
python3 telegram_client.py history --chat-id YOUR_CHAT_ID --limit 10

# Get statistics
python3 telegram_client.py stats --chat-id YOUR_CHAT_ID

# Close a session
python3 telegram_client.py close --chat-id YOUR_CHAT_ID
```

## Configuration

Edit `args/messaging.yaml`:

```yaml
telegram:
  bot_token: ${TELEGRAM_BOT_TOKEN}  # Set in .env
  rate_limit:
    requests_per_minute: 20
    burst_size: 5
  features:
    receive_messages: true
    send_messages: true
  logging:
    level: info
    file: /tmp/messaging-gateway.log

openai:
  api_key: ${OPENAI_API_KEY}  # Optional, for AI responses
  model: gpt-4o-mini
  max_tokens: 1000
```

## Features

- ✅ Send/receive messages via Telegram
- ✅ Session management
- ✅ Rate limiting (20 req/min, burst 5)
- ✅ Message storage in SQLite
- ✅ CLI tool for operations
- ✅ Memory system integration
- ✅ Structured logging
- ✅ Graceful shutdown

## Documentation

- [Full Setup Guide](SETUP_GUIDE.md) - Comprehensive instructions
- [Work Plan](../../.sisyphus/plans/messaging-gateway.md) - Implementation details
- [Summary](../../.sisyphus/notepads/messaging-gateway/SUMMARY.md) - Status overview

## Logs

View logs:
```bash
tail -f /tmp/messaging-gateway.log
```

## Troubleshooting

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for:
- Common issues
- Error messages
- Configuration tips
- Production deployment

## Architecture

```
Telegram API
    ↓
python-telegram-bot (async)
    ↓
Gateway Daemon
    ├→ Session Manager
    ├→ Message Handlers
    ├→ Rate Limiter
    ├→ Configuration
    ├→ Memory Integration
    └→ Logging
    ↓
SQLite Database
    ├→ telegram_sessions
    ├→ telegram_messages
    └→ memory_entries
```

---

*Last updated: 2026-02-04*
