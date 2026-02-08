# Telegram Bot Troubleshooting Guide

> Quick diagnosis and solutions for common Telegram bot issues.
> Created: 2026-02-04

---

## 🔴 MOST LIKELY ISSUE: .env File Doesn't Exist

### Symptoms
- You sent `/start` command in Telegram bot
- Bot didn't respond
- No daemon running

### Root Cause
The `.env` file doesn't exist in your Atlas project root. The daemon needs to read `TELEGRAM_BOT_TOKEN` from this file.

---

## ✅ Solution

### Step 1: Create .env File

**Navigate to project root:**
```bash
cd /Users/zero/Documents/Projects/Atlas
```

**Create the file:**
```bash
touch .env
```

### Step 2: Add Your Bot Token

**1. Get Your Token:**
   - Go to https://t.me/BotFather in Telegram
   - Send: `/newbot`
   - Name your bot: `AtlasMessagingBot` (or your choice)
   - BotFather will show you a token like: `1234567890:AAFT1a2b3G...`
   - **Copy this token exactly**

**2. Add to .env:**
   ```bash
   echo "TELEGRAM_BOT_TOKEN=1234567890:AAFT1a2b3G..." >> .env
   ```

   **Replace** `1234567890:AAFT1a2b3G...` with your actual token.

### Step 3: Verify

```bash
# Check if token was added
cat .env | grep TELEGRAM_BOT_TOKEN
```

**Expected output:**
```
TELEGRAM_BOT_TOKEN=1234567890:AAFT1a2b3G...
```

---

## Alternative: Use .env.example (RECOMMENDED)

Instead of editing `.env` directly, create a copy of the template:

```bash
# Copy example to .env
cp .env.example .env

# Add your token
echo "TELEGRAM_BOT_TOKEN=1234567890:AAFT1a2b3G..." >> .env

# Verify
cat .env | grep TELEGRAM_BOT_TOKEN
```

**Benefits:**
- Keeps your actual token out of git (prevents accidental commits)
- Template preserved for future reference
- Easier to share (copy .env.example to teammates)

---

## Step 4: Start the Daemon

```bash
# Navigate to project root
cd /Users/zero/Documents/Projects/Atlas

# Start daemon
python3 tools/messaging/daemon.py
```

**Expected output:**
```
INFO - Starting Telegram Gateway Daemon...
INFO - Checking database tables...
INFO - Starting Telegram bot...
INFO - Daemon started successfully!
```

**What to expect:**
- Daemon will start and listen for messages
- Logs will be written to `/tmp/messaging-gateway.log`
- Bot will appear in your Telegram app

---

## 📱 Step 5: Test in Telegram

### Find Your Bot

1. Search for `@AtlasMessagingBot` in Telegram
2. Click "Start" to start a chat
3. Send `/start` command
4. Send a test message: "Hello!"

### Try Commands

Send `/help` - Should show available commands
Send `/sessions` - List active sessions
Send `/stats` - Show conversation statistics

---

## 🔍 Other Common Issues

### Issue: "Bot token not found"

**Symptoms:**
```
Error: Missing required configuration: bot_token
```

**Solution:**
- Verify `.env` exists in project root
- Run: `cat .env | grep TELEGRAM_BOT_TOKEN`
- If empty, add your token

---

### Issue: "Bot token has wrong format"

**Symptoms:**
```
Error: Invalid bot token format: bot_token must be in format {bot_id}:{random_string}
```

**Solution:**
1. Get new token from @BotFather
2. Check it starts with numbers (e.g., `1234567890:`)
3. Update `.env`: `sed -i ''s/TELEGRAM_BOT_TOKEN=.*/TELEGRAM_BOT_TOKEN=new_token' .env`

---

### Issue: "Module not found: 'telegram'"

**Symptoms:**
```
ModuleNotFoundError: No module named 'telegram'
```

**Solution:**

Install required dependencies:
```bash
pip3 install python-telegram-bot PyYAML
```

Verify installation:
```bash
pip3 list | grep -E "telegram|yaml"
```

---

### Issue: "User not authorized"

**Symptoms:**
```
Bot responds: You are not in the allowed users list.
```

**Solution:**

Edit `args/messaging.yaml`:
```yaml
telegram:
  allowed_users:
    - 1234567890  # Your Telegram numeric user ID
    # Add more users if needed
```

**To find your user ID:**
1. Start a chat with @userinfobot
2. It will respond with your numeric ID
3. Copy the ID from the response

---

### Issue: "Daemon doesn't start"

**Symptoms:**
```
INFO - Starting Telegram Gateway Daemon...
INFO - Starting Telegram bot...
(Then nothing happens)
```

**Possible Causes:**
1. Bot token wrong or missing
2. Dependencies not installed
3. Port 443 blocked (rare)
4. Database file locked

**Solution:**

Check logs:
```bash
tail -f /tmp/messaging-gateway.log
```

Common log errors:
- `Error: Bot token invalid`
- `Error: unauthorized`
- `OperationalError: can't parse response`

---

## 📋 Getting Help

### Still Having Issues?

**Run the diagnostic script:**

```bash
cd /Users/zero/Documents/Projects/Atlas

# Quick check
echo "=== Quick Diagnostics ==="
echo ""

# 1. Check .env
echo "1. .env file..."
if [ -f .env ]; then
    echo "   ✅ Exists"
    if grep -q "TELEGRAM_BOT_TOKEN=" .env; then
        echo "   ✅ Token found"
        grep "TELEGRAM_BOT_TOKEN=" .env | head -1
else
    echo "   ✗ Not found"
    echo ""
fi
echo ""

# 2. Check Python dependencies
echo "2. Python dependencies..."
pip3 list | grep -E "telegram|yaml"
if [ $? -eq 0 ]; then
    echo "   ✅ python-telegram-bot installed"
    pip3 list | grep -E "yaml"
else
    echo "   ✗ python-telegram-bot NOT installed"
    echo "   Install: pip3 install python-telegram-bot PyYAML"
    echo ""
fi
echo ""

# 3. Check daemon status
echo "3. Daemon process..."
ps aux | grep -i "daemon.py" | grep -v grep | head -1
if [ $? -eq 0 ]; then
    echo "   ✅ Daemon is running (PID: $(pgrep -f "daemon.py" | awk '{print $2}')"
else
    echo "   ✗ Daemon NOT running"
    echo ""
fi
echo ""

# 4. Check logs
echo "4. Log file..."
if [ -f /tmp/messaging-gateway.log ]; then
    echo "   ✅ Log file exists"
    echo "   Recent errors:"
    tail -20 /tmp/messaging-gateway.log
else
    echo "   ✗ Log file doesn't exist yet (created when daemon starts)"
    echo ""
fi
echo ""

echo "=== End Diagnostics ==="
echo ""
```

---

## 📝 Full Setup Walkthrough

### Prerequisites Checklist

- [ ] Create .env file in project root
- [ ] Get Telegram bot token from @BotFather
- [ ] Add bot token to .env (format: `TELEGRAM_BOT_TOKEN=your_token`)
- [ ] Install python-telegram-bot and PyYAML
- [ ] Verify installation: `pip3 list | grep telegram`

### Deployment Steps

1. **Create .env**
   ```bash
   cd /Users/zero/Documents/Projects/Atlas
   touch .env
   echo "TELEGRAM_BOT_TOKEN=1234567890:AAFT1a2b3G..." >> .env
   ```

2. **Verify token**
   ```bash
   cat .env | grep TELEGRAM_BOT_TOKEN
   ```

3. **Start daemon**
   ```bash
   cd /Users/zero/Documents/Projects/Atlas
   python3 tools/messaging/daemon.py
   ```

4. **Test in Telegram**
   - Find your bot by name
   - Start a chat: `/start`
   - Send test message
   - Check responses in Telegram

---

## 🔧 Advanced: Daemon Verification

### Check Daemon Process

```bash
# See if daemon is running
ps aux | grep -i "daemon.py" | grep -v grep
```

Expected: One line with daemon.py PID number

### Check Logs

```bash
# View last 20 lines of logs
tail -20 /tmp/messaging-gateway.log
```

### Check Database

```bash
# Check if tables exist
sqlite3 data/memory.db "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'telegram_%'"
```

Expected: 3 tables (telegram_sessions, telegram_messages, telegram_webhooks)

---

## 📚 Contact & Support

If you continue to have issues after following this guide:

1. Copy the exact error message you're seeing
2. Run the diagnostic script above and share output
3. Check logs: `tail -50 /tmp/messaging-gateway.log`

---

## ✅ Success Indicators

You'll know it's working when you see:

1. **In Telegram**: Bot responds to `/start` with welcome message
2. **In Terminal**: Daemon shows "Daemon started successfully!"
3. **In Logs**: No errors in `/tmp/messaging-gateway.log`
4. **Test Message**: Your message appears in Telegram chat

---

*Last updated: 2026-02-04*
