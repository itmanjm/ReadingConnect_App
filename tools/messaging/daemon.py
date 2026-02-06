#!/usr/bin/env python3
"""
Telegram Gateway Daemon

Long-running async process that manages all Telegram bot operations.
Integrates with GOTCHA framework (memory system, args configuration).

Usage:
    python tools/messaging/daemon.py

Features:
- Async event loop with python-telegram-bot
- Session management (create, update, close, list)
- Message handling (incoming, outgoing, edits, deletions)
- Rate limiting (20 req/min, burst of 5)
- Memory system integration (context loading, message storage)
- Configuration from args/messaging.yaml
- Structured logging
- Graceful shutdown
"""

import asyncio
import logging
import signal
import sys
import json
import os
import re
from pathlib import Path
from typing import Optional, Dict, List, Any
from datetime import datetime, timedelta
import sqlite3
import yaml

try:
    from telegram import Update
    from telegram.ext import (
        Application,
        CommandHandler,
        MessageHandler,
        CallbackQueryHandler,
        filters,
        ContextTypes,
    )
except ImportError:
    print("Error: python-telegram-bot not installed")
    print("Run: pip install python-telegram-bot")
    sys.exit(1)

# Paths
PROJECT_ROOT = Path(__file__).parent.parent.parent
DB_PATH = PROJECT_ROOT / "data" / "memory.db"
CONFIG_PATH = PROJECT_ROOT / "args" / "messaging.yaml"
ENV_PATH = PROJECT_ROOT / ".env"
MEMORY_TOOLS_PATH = PROJECT_ROOT / "tools" / "memory"
GOALS_MANIFEST = PROJECT_ROOT / "goals" / "manifest.md"

# Add project root to path for skill imports
sys.path.insert(0, str(PROJECT_ROOT))

# ============================================================================
# Configuration Loading
# ============================================================================


def load_env_vars() -> Dict[str, str]:
    """Load environment variables from .env file."""
    env_vars = {}
    if ENV_PATH.exists():
        with open(ENV_PATH, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    env_vars[key.strip()] = value.strip()
    return env_vars


def substitute_env_vars(value: str, env_vars: Dict[str, str]) -> str:
    """Substitute ${VAR} environment variables in string."""
    pattern = r"\$\{([^}]+)\}"

    def replacer(match):
        var_name = match.group(1)
        return env_vars.get(var_name, match.group(0))

    return re.sub(pattern, replacer, value)


def load_config() -> Dict[str, Any]:
    """Load and parse configuration from args/messaging.yaml."""
    env_vars = load_env_vars()

    if not CONFIG_PATH.exists():
        raise FileNotFoundError(f"Configuration file not found: {CONFIG_PATH}")

    with open(CONFIG_PATH, "r") as f:
        config_str = f.read()

    # Substitute environment variables
    config_str = substitute_env_vars(config_str, env_vars)

    config = yaml.safe_load(config_str)

    # Validate required fields
    if "telegram" not in config:
        raise ValueError("Missing 'telegram' section in configuration")

    if "bot_token" not in config["telegram"] or not config["telegram"]["bot_token"]:
        raise ValueError(
            "Missing or empty 'telegram.bot_token' in configuration. "
            "Set TELEGRAM_BOT_TOKEN in .env file."
        )

    return config


# ============================================================================
# Database Operations
# ============================================================================


def get_connection():
    """Get database connection."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def ensure_tables():
    """Ensure database tables exist."""
    conn = get_connection()
    cursor = conn.cursor()

    # Sessions table
    cursor.execute(
        """
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
        )
    """
    )

    # Messages table
    cursor.execute(
        """
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
        )
    """
    )

    # Webhooks table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS telegram_webhooks (
            id INTEGER PRIMARY KEY,
            event_type TEXT NOT NULL,
            payload TEXT,
            processed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """
    )

    # Indexes
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_telegram_sessions_chat ON telegram_sessions(telegram_chat_id)"
    )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_telegram_messages_session ON telegram_messages(session_id)"
    )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_telegram_messages_created ON telegram_messages(created_at)"
    )

    conn.commit()
    conn.close()

    # Build sessions table
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
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
        )
    """
    )

    # Build output table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS build_output (
            id INTEGER PRIMARY KEY,
            session_id TEXT NOT NULL,
            line_number INTEGER NOT NULL,
            content TEXT NOT NULL,
            is_error BOOLEAN DEFAULT FALSE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES build_sessions(session_id) ON DELETE CASCADE
        )
    """
    )

    # Indexes
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_build_sessions_session ON build_sessions(session_id)"
    )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_build_sessions_user ON build_sessions(user_id)"
    )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_build_output_session ON build_output(session_id)"
    )

    conn.commit()
    conn.close()


def create_build_session(
    session_id: str, goal_name: str, user_id: int, chat_id: str, pid: int = None
) -> bool:
    """Create a new build session."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO build_sessions (session_id, goal_name, user_id, chat_id, status, pid)
            VALUES (?, ?, ?, ?, 'running', ?)
            """,
            (session_id, goal_name, user_id, chat_id, pid),
        )
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()


def get_build_session(session_id: str) -> Optional[Dict]:
    """Get build session by ID."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT session_id, goal_name, user_id, chat_id, status, current_step,
               progress, pid, output, error_message, created_at, completed_at
        FROM build_sessions WHERE session_id = ?
        """,
        (session_id,),
    )
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None


def update_build_progress(session_id: str, step: str = None, progress: int = None):
    """Update build session progress."""
    conn = get_connection()
    cursor = conn.cursor()
    if step:
        cursor.execute(
            "UPDATE build_sessions SET current_step = ?, updated_at = CURRENT_TIMESTAMP WHERE session_id = ?",
            (step, session_id),
        )
    if progress is not None:
        cursor.execute(
            "UPDATE build_sessions SET progress = ?, updated_at = CURRENT_TIMESTAMP WHERE session_id = ?",
            (progress, session_id),
        )
    conn.commit()
    conn.close()


def add_build_output(session_id: str, content: str, is_error: bool = False):
    """Add a line to build output."""
    conn = get_connection()
    cursor = conn.cursor()
    # Get current line number
    cursor.execute(
        "SELECT MAX(line_number) FROM build_output WHERE session_id = ?", (session_id,)
    )
    result = cursor.fetchone()
    line_number = (result[0] + 1) if result and result[0] else 0

    cursor.execute(
        """
        INSERT INTO build_output (session_id, line_number, content, is_error)
        VALUES (?, ?, ?, ?)
        """,
        (session_id, line_number, content, is_error),
    )
    conn.commit()
    conn.close()


def complete_build_session(
    session_id: str, status: str, error_message: str = None, project_path: str = None
):
    """Mark build session as completed."""
    conn = get_connection()
    cursor = conn.cursor()
    if project_path:
        cursor.execute(
            """
            UPDATE build_sessions
            SET status = ?, error_message = ?, project_path = ?, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE session_id = ?
            """,
            (status, error_message, project_path, session_id),
        )
    else:
        cursor.execute(
            """
            UPDATE build_sessions
            SET status = ?, error_message = ?, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE session_id = ?
            """,
            (status, error_message, session_id),
        )
    conn.commit()
    conn.close()


def update_build_path(session_id: str, project_path: str):
    """Update build session with project path."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE build_sessions SET project_path = ?, updated_at = CURRENT_TIMESTAMP WHERE session_id = ?",
        (project_path, session_id),
    )
    conn.commit()
    conn.close()


def kill_build_session(session_id: str) -> bool:
    """Kill a running build and update status."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT pid FROM build_sessions WHERE session_id = ? AND status = 'running'",
        (session_id,),
    )
    row = cursor.fetchone()
    if row and row["pid"]:
        import os

        try:
            os.kill(row["pid"], 9)  # SIGKILL
        except ProcessLookupError:
            pass  # Process already dead
    cursor.execute(
        """
        UPDATE build_sessions
        SET status = 'killed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE session_id = ?
        """,
        (session_id,),
    )
    conn.commit()
    conn.close()
    return True


def get_user_builds(user_id: int, limit: int = 10) -> List[Dict]:
    """Get recent builds for a user."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT session_id, goal_name, status, current_step, progress, created_at, completed_at
        FROM build_sessions WHERE user_id = ?
        ORDER BY created_at DESC LIMIT ?
        """,
        (user_id, limit),
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_build_output(
    session_id: str, from_line: int = 0, limit: int = 50
) -> List[Dict]:
    """Get build output lines."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT line_number, content, is_error, created_at
        FROM build_output WHERE session_id = ? AND line_number >= ?
        ORDER BY line_number ASC LIMIT ?
        """,
        (session_id, from_line, limit),
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_or_create_session(
    chat_id: str, user_id: int, title: Optional[str] = None
) -> int:
    """Get or create a Telegram session."""
    conn = get_connection()
    cursor = conn.cursor()

    # Try to get existing session
    cursor.execute(
        "SELECT id FROM telegram_sessions WHERE telegram_chat_id = ?", (str(chat_id),)
    )
    row = cursor.fetchone()

    if row:
        session_id = row[0]
        cursor.execute(
            """
            UPDATE telegram_sessions
            SET last_message_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP,
                message_count = message_count + 1,
                title = COALESCE(?, title)
            WHERE id = ?
        """,
            (title, session_id),
        )
    else:
        cursor.execute(
            """
            INSERT INTO telegram_sessions
            (telegram_chat_id, telegram_user_id, title, message_count, last_message_at, is_active)
            VALUES (?, ?, 1, CURRENT_TIMESTAMP, TRUE)
        """,
            (str(chat_id), user_id, title),
        )
        session_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return session_id


def store_message(
    session_id: int,
    message_id: int,
    direction: str,
    content: str,
    content_type: str = "text",
    metadata: Optional[Dict] = None,
) -> int:
    """Store a message in the database."""
    conn = get_connection()
    cursor = conn.cursor()

    metadata_json = json.dumps(metadata) if metadata else "{}"

    cursor.execute(
        """
        INSERT INTO telegram_messages
        (session_id, message_id, direction, content, content_type, metadata, created_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    """,
        (session_id, message_id, direction, content, content_type, metadata_json),
    )

    db_message_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return db_message_id


def list_active_sessions() -> List[Dict[str, Any]]:
    """List all active sessions."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, telegram_chat_id, telegram_user_id, title, message_count, last_message_at, created_at
        FROM telegram_sessions
        WHERE is_active = TRUE
        ORDER BY last_message_at DESC
    """
    )

    sessions = []
    for row in cursor.fetchall():
        sessions.append(
            {
                "id": row[0],
                "chat_id": row[1],
                "user_id": row[2],
                "title": row[3],
                "message_count": row[4],
                "last_message_at": row[5],
                "created_at": row[6],
            }
        )

    conn.close()
    return sessions


def get_available_goals() -> List[str]:
    """Get available goals from manifest."""
    if not GOALS_MANIFEST.exists():
        return []

    goals = []
    with open(GOALS_MANIFEST, "r") as f:
        for line in f:
            if " | " in line:
                parts = line.split("|")
                for part in parts:
                    goal = part.strip()
                    if goal and goal not in ["Goal", "Description", "Status", "-"]:
                        goals.append(goal)
    return goals


def start_opcode_build(
    goal_name: str, user_id: int, chat_id: str, builder: str = "opencode"
) -> Dict[str, Any]:
    """Start build subprocess and return session info."""
    import subprocess
    import threading

    session_id = f"ses_{datetime.now().strftime('%Y%m%d%H%M%S')}"

    try:
        goal_file = PROJECT_ROOT / "goals" / f"{goal_name}.md"
        if not goal_file.exists():
            return {
                "success": False,
                "error": f"Goal file not found: {goal_file}",
                "session_id": None,
            }

        create_build_session(session_id, goal_name, user_id, chat_id)

        script_path = PROJECT_ROOT / "tools" / "build_runner.py"

        if not script_path.exists():
            create_build_runner_script(script_path)

        # Build command with builder flag
        cmd = ["python3", str(script_path), goal_name, session_id]
        if builder == "claude":
            cmd.append("--claude")

        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
        )

        pid = proc.pid

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE build_sessions SET pid = ? WHERE session_id = ?", (pid, session_id)
        )
        conn.commit()
        conn.close()

        def read_output():
            for line in iter(proc.stdout.readline, ""):
                if line:
                    add_build_output(session_id, line.rstrip("\n"), is_error=False)
            proc.stdout.close()
            proc.wait()
            return_code = proc.returncode
            if return_code == 0:
                complete_build_session(session_id, "completed")
            else:
                complete_build_session(
                    session_id, "failed", f"Process exited with code {return_code}"
                )

        thread = threading.Thread(target=read_output, daemon=True)
        thread.start()

        return {
            "success": True,
            "session_id": session_id,
            "pid": pid,
            "goal": goal_name,
            "status": "running",
        }
    except Exception as e:
        add_build_output(session_id, f"Error starting build: {str(e)}", is_error=True)
        complete_build_session(session_id, "failed", str(e))
        return {"success": False, "error": str(e), "session_id": session_id}


def create_build_runner_script(script_path: Path):
    """Create the build runner script."""
    script_content = '''#!/usr/bin/env python3
"""
Build Runner Script

Executes goal workflows and streams output.
"""

import sys
import time
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from tools.messaging.daemon import (
    update_build_progress,
    add_build_output,
    complete_build_session,
)


def run_goal_workflow(goal_name: str, session_id: str):
    """Execute goal workflow steps."""
    goal_file = PROJECT_ROOT / "goals" / f"{goal_name}.md"

    if not goal_file.exists():
        add_build_output(session_id, f"Error: Goal file not found: {goal_file}", is_error=True)
        complete_build_session(session_id, "failed", f"Goal file not found: {goal_file}")
        return

    add_build_output(session_id, f"🚀 Starting build: {goal_name}", is_error=False)
    add_build_output(session_id, f"📄 Loading goal from: {goal_file.name}", is_error=False)

    # Simulate ATLAS workflow steps
    atlas_steps = [
        ("A", "Architect", 10),
        ("T", "Trace", 30),
        ("L", "Link", 50),
        ("A", "Assemble", 80),
        ("S", "Stress-test", 100),
    ]

    for step_letter, step_name, progress in atlas_steps:
        add_build_output(session_id, f"\\n{'='*50}", is_error=False)
        add_build_output(session_id, f"📋 Step {step_letter}: {step_name}", is_error=False)
        update_build_progress(session_id, step=step_name, progress=progress)

        # Simulate work
        time.sleep(1)

        # For demo: generate sample output based on goal
        if goal_name == "build_app":
            add_build_output(session_id, f"  → Analyzing requirements...", is_error=False)
            time.sleep(0.5)
            add_build_output(session_id, f"  → Generating code structure...", is_error=False)
            time.sleep(0.5)
            add_build_output(session_id, f"  → Creating components...", is_error=False)
            time.sleep(0.5)
            add_build_output(session_id, f"  → ✓ Step {step_letter} complete", is_error=False)
        else:
            add_build_output(session_id, f"  → Processing {step_name}...", is_error=False)
            time.sleep(0.5)
            add_build_output(session_id, f"  → ✓ Step {step_letter} complete", is_error=False)

    add_build_output(session_id, f"\\n{'='*50}", is_error=False)
    add_build_output(session_id, f"✅ Build completed successfully!", is_error=False)
    complete_build_session(session_id, "completed")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python build_runner.py <goal_name> <session_id>")
        sys.exit(1)

    goal_name = sys.argv[1]
    session_id = sys.argv[2]

    run_goal_workflow(goal_name, session_id)
'''

    with open(script_path, "w") as f:
        f.write(script_content)
    script_path.chmod(0o755)


# ============================================================================
# Rate Limiter (Token Bucket Algorithm)
# ============================================================================


class RateLimiter:
    """Token bucket rate limiter."""

    def __init__(self, rate_per_minute: int, burst_size: int):
        self.rate = rate_per_minute / 60.0
        self.burst_size = burst_size
        self.tokens = burst_size
        self.last_update = asyncio.get_event_loop().time()
        self._lock = asyncio.Lock()

    async def acquire(self, tokens: int = 1) -> bool:
        """Acquire tokens from bucket. Returns True if successful."""
        async with self._lock:
            now = asyncio.get_event_loop().time()
            elapsed = now - self.last_update

            # Refill tokens
            self.tokens += elapsed * self.rate
            if self.tokens > self.burst_size:
                self.tokens = self.burst_size

            self.last_update = now

            # Check if we have enough tokens
            if self.tokens >= tokens:
                self.tokens -= tokens
                return True
            else:
                return False

    async def wait_for_token(self, tokens: int = 1, timeout: float = 10.0) -> bool:
        """Wait until we have enough tokens."""
        deadline = asyncio.get_event_loop().time() + timeout

        while asyncio.get_event_loop().time() < deadline:
            if await self.acquire(tokens):
                return True
            await asyncio.sleep(0.1)

        return False


# ============================================================================
# Memory System Integration
# ============================================================================


class MemoryIntegrator:
    """Integration with memory system."""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.openai_config = config.get("openai", {})
        self.zai_config = config.get("zai", {})
        # Enable if either OpenAI or ZAI is configured
        self.enabled = bool(self.openai_config.get("api_key")) or bool(
            self.zai_config.get("api_key")
        )
        self.use_zai = bool(self.zai_config.get("api_key"))

    async def load_context(self, session_id: int) -> str:
        """Load relevant memory context for a session."""
        if not self.enabled:
            return ""

        try:
            # Import memory tools
            sys.path.insert(0, str(MEMORY_TOOLS_PATH))

            import memory_read

            # Use ZAI config if available, otherwise fall back to OpenAI
            config = self.zai_config if self.use_zai else self.openai_config
            context_entries = config.get("context_entries", 50)

            # Get recent entries
            result = await asyncio.to_thread(
                memory_read.main,
                "--format",
                "markdown",
                "--limit",
                str(context_entries),
            )

            return result

        except Exception as e:
            logging.warning(f"Failed to load memory context: {e}")
            return ""

    async def store_message_as_event(self, content: str, session_id: int) -> bool:
        """Store a message as an event in memory."""
        try:
            sys.path.insert(0, str(MEMORY_TOOLS_PATH))

            import memory_write

            await asyncio.to_thread(
                memory_write.main,
                "--content",
                f"[Telegram Session {session_id}] {content}",
                "--type",
                "event",
            )

            return True

        except Exception as e:
            logging.warning(f"Failed to store message in memory: {e}")
            return False

    async def extract_and_store_fact(self, text: str) -> Optional[str]:
        """Extract fact from text using OpenAI."""
        if not self.enabled:
            return None

        # This is a placeholder - actual implementation would call OpenAI
        # For now, just return text as-is
        return text


# ============================================================================
# Main Daemon Class
# ============================================================================


class TelegramGatewayDaemon:
    """Main Telegram gateway daemon."""

    def __init__(self):
        self.config = load_config()
        self.rate_limiter = RateLimiter(
            rate_per_minute=self.config["telegram"]["rate_limit"][
                "requests_per_minute"
            ],
            burst_size=self.config["telegram"]["rate_limit"]["burst_size"],
        )
        self.memory = MemoryIntegrator(self.config)
        self.application: Optional[Application] = None
        self.shutdown_event = asyncio.Event()

        # Setup logging
        self._setup_logging()

    async def start(self):
        """Start the daemon."""
        self.logger.info("Starting Telegram Gateway Daemon...")

        # Ensure database tables exist
        self.logger.info("Checking database tables...")
        ensure_tables()

        # Create Telegram application
        bot_token = self.config["telegram"]["bot_token"]
        self.application = (
            Application.builder()
            .token(bot_token)
            .connect_timeout(30.0)
            .read_timeout(30.0)
            .write_timeout(30.0)
            .build()
        )

        # ============================================================================
        # Bot Command Menu Setup
        # ============================================================================
        # PATTERN FOR ADDING NEW COMMANDS:
        # 1. Add handler in _register_handlers():
        #    self.application.add_handler(CommandHandler("cmdname", self.cmd_cmdname))
        #
        # 2. Add BotCommand here:
        #    BotCommand("cmdname", "Description of what it does"),
        #
        # 3. Create cmd_cmdname() async method (in appropriate section below)
        # ============================================================================

        from telegram import BotCommand

        commands = [
            BotCommand("start", "Start the bot"),
            BotCommand("help", "Show help information"),
            BotCommand("sessions", "List active sessions"),
            BotCommand("stats", "Conversation statistics"),
            BotCommand("build", "Start a build workflow"),
            BotCommand("status", "Check build progress"),
            BotCommand("kill", "Cancel a build"),
            BotCommand("cron", "List cron jobs"),
            BotCommand("cron_create", "Create a cron job"),
            BotCommand("cron_history", "Show job execution history"),
            BotCommand("cron_run", "Trigger a job immediately"),
            BotCommand("cron_pause", "Pause a cron job"),
            BotCommand("cron_resume", "Resume a paused job"),
            BotCommand("cron_delete", "Delete a cron job"),
        ]
        await self.application.bot.set_my_commands(commands)
        self.logger.info("Bot command menu configured")

        # Register handlers
        self._register_handlers()

        # Start application
        self.logger.info("Starting Telegram bot...")
        await self.application.initialize()
        await self.application.start()

        # Start polling
        self.logger.info("Starting message polling...")
        await self.application.updater.start_polling()

        # Start cron job scheduler
        try:
            from tools.cron_manager import CronScheduler

            self.scheduler = CronScheduler(check_interval=60)
            await self.scheduler.start()
            self.logger.info("Cron scheduler started")
        except ImportError as e:
            self.logger.warning(f"Cron scheduler not available: {e}")
            self.scheduler = None

        self.logger.info("Daemon started successfully!")

    def _setup_logging(self):
        """Setup logging configuration."""
        log_config = self.config["telegram"]["logging"]
        log_level = getattr(logging, log_config["level"].upper(), logging.INFO)
        log_file = log_config["file"]

        # Create log directory if needed
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)

        # Configure logging
        logging.basicConfig(
            level=log_level,
            format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler(sys.stdout),
            ],
        )

        self.logger = logging.getLogger("TelegramGatewayDaemon")

    async def handle_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle callback queries (button interactions)."""
        query = update.callback_query
        if query:
            await query.answer("This feature is not yet implemented.")
        else:
            await update.effective_message.reply_text("No query specified.")

    async def cmd_stop(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /stop command."""
        await update.effective_message.reply_text("🛑 Stopping daemon...")

        # Stop application
        await self.application.stop()
        await self.application.shutdown()

        # Stop cron scheduler
        if self.scheduler:
            await self.scheduler.stop()

        self.logger.info("Daemon stopped.")

        # Set shutdown event
        self.shutdown_event.set()

    def _register_handlers(self):
        """Register all message and command handlers."""

        # Command handlers
        self.application.add_handler(CommandHandler("start", self.cmd_start))
        self.application.add_handler(CommandHandler("help", self.cmd_help))
        self.application.add_handler(CommandHandler("sessions", self.cmd_sessions))
        self.application.add_handler(CommandHandler("stats", self.cmd_stats))
        self.application.add_handler(CommandHandler("build", self.cmd_build))
        self.application.add_handler(CommandHandler("status", self.cmd_status))
        self.application.add_handler(CommandHandler("kill", self.cmd_kill))

        # Cron job command handlers
        self.application.add_handler(CommandHandler("cron", self.cmd_cron_list))
        self.application.add_handler(
            CommandHandler("cron_create", self.cmd_cron_create)
        )
        self.application.add_handler(
            CommandHandler("cron_history", self.cmd_cron_history)
        )
        self.application.add_handler(CommandHandler("cron_run", self.cmd_cron_run))
        self.application.add_handler(
            CommandHandler("cron_delete", self.cmd_cron_delete)
        )
        self.application.add_handler(CommandHandler("cron_pause", self.cmd_cron_pause))
        self.application.add_handler(
            CommandHandler("cron_resume", self.cmd_cron_resume)
        )

        # Message handler
        if self.config["telegram"]["features"]["receive_messages"]:
            self.application.add_handler(
                MessageHandler(filters.TEXT & ~filters.COMMAND, self.handle_message)
            )

        # Callback query handler (for button interactions)
        if self.config["telegram"]["features"]["bot_commands"]:
            self.application.add_handler(CallbackQueryHandler(self.handle_callback))

    async def cmd_start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /start command."""
        user = update.effective_user
        self.logger.info(f"User {user.id} ({user.username}) started bot")

        await update.effective_message.reply_text(
            "🤖 *Welcome to Atlas Messaging Bot!*\n\n"
            "I'm your personal AI assistant integrated with Atlas/GOTCHA framework.\n\n"
            "*Available Commands:*\n"
            "/start - Show this welcome message\n"
            "/help - Show help information\n"
            "/sessions - List active sessions\n"
            "/stats - Show conversation statistics\n"
            "/build <goal> - Start a build workflow\n"
            "/status <session_id> - Check build progress\n"
            "/kill <session_id> - Cancel a build\n\n"
            "Just send me a message or say 'build me <goal>' to trigger workflows!",
            parse_mode="Markdown",
        )

    async def cmd_help(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /help command."""
        await update.effective_message.reply_text(
            "📖 *Help*\n\n"
            "*Commands:*\n"
            "/start - Welcome message\n"
            "/help - Show this help\n"
            "/sessions - List active sessions\n"
            "/stats - Conversation statistics\n"
            "/build <goal> - Start a build workflow\n"
            "/status <session_id> - Check build progress\n"
            "/kill <session_id> - Cancel a build\n\n"
            "*Cron Jobs:*\n"
            "/cron - List all cron jobs\n"
            '/cron create "<name>" "<schedule>" "<command>" - Create job\n'
            "/cron history <job_id> - View execution history\n"
            "/cron run <job_id> - Trigger job immediately\n"
            "/cron pause <job_id> - Pause a job\n"
            "/cron resume <job_id> - Resume a job\n"
            "/cron delete <job_id> - Delete a job\n\n"
            "*Features:*\n"
            "✅ Send and receive messages\n"
            "✅ Memory integration\n"
            "✅ Context-aware responses\n"
            "✅ Remote build triggers\n"
            "✅ Session management\n"
            "✅ Cron job scheduling\n\n"
            "*Usage:*\n"
            "Say 'build me a dashboard' or use /build <goal_name> to start builds\n"
            "Use /status <id> to check progress\n"
            "Use /cron create to schedule automated tasks",
            parse_mode="Markdown",
        )

    async def cmd_sessions(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /sessions command."""
        sessions = await asyncio.to_thread(list_active_sessions)

        if not sessions:
            await update.effective_message.reply_text("No active sessions found.")
            return

        message = f"📋 *Active Sessions* ({len(sessions)})\n\n"
        for session in sessions[:10]:
            message += f"• `{session['chat_id']}` - {session['message_count']} msgs\n"

        if len(sessions) > 10:
            message += f"\n... and {len(sessions) - 10} more"

        await update.effective_message.reply_text(message, parse_mode="Markdown")

    async def cmd_stats(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /stats command."""
        chat_id = str(update.effective_chat.id)

        conn = get_connection()
        cursor = conn.cursor()

        # Get session stats
        cursor.execute(
            """
            SELECT
                direction,
                content_type,
                COUNT(*) as count
            FROM telegram_messages
            WHERE session_id = ?
            GROUP BY direction, content_type
            """,
            (chat_id,),
        )

        stats = cursor.fetchall()
        conn.close()

        if not stats:
            await update.effective_message.reply_text(
                "No statistics available for this session."
            )
            return

        message = f"📊 *Statistics for {chat_id}*\n\n"

        current_direction = None
        for stat in stats:
            direction, content_type, count = stat
            if direction != current_direction:
                current_direction = direction
                message += f"*{direction.upper()}*\n"

            message += f"  {content_type}: {count} messages\n"

        await update.effective_message.reply_text(message, parse_mode="Markdown")

    async def cmd_build(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /build command."""
        user = update.effective_user

        # Security check - only allow user 7700153618
        if user.id != 7700153618:
            await update.effective_message.reply_text(
                "⛔ Sorry, only authorized users can trigger builds."
            )
            return

        # Parse goal name and options
        args = context.args if context.args else []

        # Check for --claude flag
        use_claude = False
        if "--claude" in args:
            use_claude = True
            args.remove("--claude")

        if not args:
            goals = get_available_goals()
            if goals:
                goals_list = "\n".join(f"• {g}" for g in goals)
                await update.effective_message.reply_text(
                    f"📋 *Available Goals:*\n\n{goals_list}\n\n"
                    f"*Usage:*\n"
                    f"`/build <goal>` - Build with OpenCode (default)\n"
                    f"`/build <goal> --claude` - Build with Claude Code CLI",
                    parse_mode="Markdown",
                )
            else:
                await update.effective_message.reply_text("No goals available.")
            return

        goal_name = args[0]

        # Validate goal
        available_goals = get_available_goals()
        if goal_name not in available_goals:
            await update.effective_message.reply_text(
                f"⛔ Unknown goal: {goal_name}\n\nAvailable goals:\n"
                + "\n".join(f"• {g}" for g in available_goals)
            )
            return

        builder = "claude" if use_claude else "opencode"

        # Start build
        self.logger.info(
            f"Starting build for goal: {goal_name} with {builder} (user: {user.id})"
        )
        await update.effective_message.reply_text(
            f"🚀 Starting build: {goal_name} ({builder.upper()})..."
        )

        # Start build subprocess with user and chat info
        chat_id = str(update.effective_chat.id)
        build_info = await asyncio.to_thread(
            start_opcode_build, goal_name, user.id, chat_id, builder
        )

        if build_info["success"]:
            session_id = build_info["session_id"]
            pid = build_info.get("pid", 0)
            await update.effective_message.reply_text(
                f"✅ Build started!\n\n"
                f"Session ID: `{session_id}`\n"
                f"PID: {pid}\n"
                f"Builder: {builder.upper()}\n\n"
                f"Use `/status {session_id}` to check progress."
            )
        else:
            await update.effective_message.reply_text(
                f"❌ Failed to start build: {build_info.get('error', 'Unknown error')}"
            )

    async def cmd_status(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /status command."""
        args = context.args if context.args else []
        if not args:
            await update.effective_message.reply_text("Usage: /status <session_id>")
            return

        session_id = args[0]

        # Get build session from database
        build_session = await asyncio.to_thread(get_build_session, session_id)

        if not build_session:
            await update.effective_message.reply_text(
                f"❌ Session not found: `{session_id}`"
            )
            return

        status = build_session["status"]
        goal = build_session["goal_name"]
        step = build_session["current_step"] or "pending"
        progress = build_session["progress"]
        created_at = build_session["created_at"]
        completed_at = build_session["completed_at"]
        project_path = build_session.get("project_path")

        # Status emoji
        status_emoji = {
            "pending": "⏳",
            "running": "🔄",
            "completed": "✅",
            "failed": "❌",
            "killed": "🛑",
        }.get(status, "?")

        # Progress bar
        bar_length = 20
        filled = int(progress / 100 * bar_length)
        bar = "█" * filled + "░" * (bar_length - filled)

        message = (
            f"{status_emoji} *Build Status*\n\n"
            f"Session ID: `{session_id}`\n"
            f"Goal: `{goal}`\n"
            f"Status: `{status.upper()}`\n"
            f"Step: `{step}`\n\n"
            f"Progress: {progress}%\n"
            f"`{bar}`\n\n"
            f"Started: `{created_at}`\n"
        )

        if completed_at:
            message += f"Completed: `{completed_at}`\n"

        # Show project path if completed
        if status == "completed" and project_path:
            message += f"\n📁 *Project Location:*\n`{project_path}`\n"
            message += (
                f"\n🚀 *Quick Launch:*\n```bash\nopen {project_path}/index.html\n```\n"
            )

        if build_session.get("error_message"):
            message += f"\n❌ Error: {build_session['error_message']}"

        # Get recent output
        output = await asyncio.to_thread(
            get_build_output, session_id, from_line=0, limit=10
        )
        if output:
            message += f"\n\n📋 *Recent Output:*\n"
            for line in output[-5:]:
                content = (
                    line["content"][:100] + "..."
                    if len(line["content"]) > 100
                    else line["content"]
                )
                # Escape backticks and special chars for Markdown
                content = content.replace("`", "'")
                message += f"```\n{content}\n```\n"

        try:
            await update.effective_message.reply_text(message, parse_mode="Markdown")
        except Exception as e:
            # Fallback to plain text if markdown fails
            await update.effective_message.reply_text(message)

    async def cmd_kill(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /kill command."""
        args = context.args if context.args else []
        if not args:
            await update.effective_message.reply_text("Usage: /kill <session_id>")
            return

        session_id = args[0]

        # Security check - only allow user 7700153618
        if update.effective_user.id != 7700153618:
            await update.effective_message.reply_text(
                "⛔ Only authorized users can kill builds."
            )
            return

        # Get build session
        build_session = await asyncio.to_thread(get_build_session, session_id)

        if not build_session:
            await update.effective_message.reply_text(
                f"❌ Session not found: `{session_id}`"
            )
            return

        if build_session["status"] not in ["pending", "running"]:
            await update.effective_message.reply_text(
                f"🛑 Cannot kill session in status: `{build_session['status']}`"
            )
            return

        # Kill the build
        self.logger.info(f"Killing build: {session_id}")
        await asyncio.to_thread(kill_build_session, session_id)

        await update.effective_message.reply_text(
            f"🛑 *Build Killed*\n\n"
            f"Session ID: `{session_id}`\n"
            f"Goal: `{build_session['goal_name']}`\n"
            f"Status: `KILLED`"
        )

    # =========================================================================
    # Cron Job Commands
    # =========================================================================

    async def cmd_cron_list(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /cron command - list cron jobs."""
        user = update.effective_user

        # Security check
        if user.id != 7700153618:
            await update.effective_message.reply_text(
                "⛔ Only authorized users can manage cron jobs."
            )
            return

        # Import cron functions
        from tools.cron_manager import list_cron_jobs, parse_schedule

        jobs = await asyncio.to_thread(list_cron_jobs, user.id, "active")

        if not jobs:
            await update.effective_message.reply_text(
                "📋 *Cron Jobs*\n\nNo active cron jobs.\n\n"
                f"Create one with:\n"
                f'`/cron create daily_backup "0 8 * * *" "python backup.py"`'
            )
            return

        message = "📋 *Active Cron Jobs*\n\n"
        for job in jobs[:10]:  # Show max 10
            schedule_info = await asyncio.to_thread(parse_schedule, job["schedule"])
            next_run = (
                schedule_info.get("human", "Unknown")
                if schedule_info["valid"]
                else "Invalid"
            )
            message += (
                f"• `{job['job_id']}`\n"
                f"  Name: {job['name']}\n"
                f"  Schedule: `{job['schedule']}` ({next_run})\n"
                f"  Type: {job['job_type']}\n\n"
            )

        if len(jobs) > 10:
            message += f"... and {len(jobs) - 10} more jobs"

        await update.effective_message.reply_text(message, parse_mode="Markdown")

    async def cmd_cron_create(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /cron create command."""
        user = update.effective_user

        # Security check
        if user.id != 7700153618:
            await update.effective_message.reply_text(
                "⛔ Only authorized users can create cron jobs."
            )
            return

        args = context.args if context.args else []

        if len(args) < 3:
            await update.effective_message.reply_text(
                "📅 *Create Cron Job*\n\n"
                f'Usage: `/cron create "<name>" "<schedule>" "<command>"`\n\n'
                f"Examples:\n"
                f'`/cron create "daily_backup" "0 2 * * *" "python backup.py"`\n'
                f'`/cron create "youtube_check" "0 8 * * *" "build youtube_monitoring"`\n\n'
                f"*Schedule Format:* minute hour day month weekday\n"
                f"  `0 8 * * *` = 8am daily\n"
                f"  `0 8 * * 1` = 8am every Monday\n"
                f"  `*/15 * * * *` = every 15 minutes"
            )
            return

        name = args[0]
        schedule = args[1]
        command = " ".join(args[2:])

        # Determine job type
        job_type = "shell"
        goal_name = None
        if command.startswith("build "):
            job_type = "build"
            goal_name = command.replace("build ", "").strip()
        elif command.startswith("goal "):
            job_type = "goal"
            goal_name = command.replace("goal ", "").strip()

        # Import cron functions
        from tools.cron_manager import create_cron_job, generate_job_id, parse_schedule

        # Validate schedule
        schedule_info = await asyncio.to_thread(parse_schedule, schedule)
        if not schedule_info["valid"]:
            await update.effective_message.reply_text(
                f"❌ Invalid schedule: `{schedule}`\n\nError: {schedule_info.get('error', 'Unknown')}"
            )
            return

        job_id = await asyncio.to_thread(generate_job_id, name)

        chat_id = str(update.effective_chat.id)
        success = await asyncio.to_thread(
            create_cron_job,
            job_id=job_id,
            name=name,
            command=command,
            schedule=schedule,
            job_type=job_type,
            goal_name=goal_name,
            user_id=user.id,
            chat_id=chat_id,
        )

        if success:
            await update.effective_message.reply_text(
                f"✅ *Cron Job Created*\n\n"
                f"Job ID: `{job_id}`\n"
                f"Name: {name}\n"
                f"Schedule: `{schedule}` ({schedule_info['human']})\n"
                f"Command: `{command}`\n\n"
                f"Use `/cron history {job_id}` to view execution history."
            )
        else:
            await update.effective_message.reply_text(f"❌ Failed to create cron job.")

    async def cmd_cron_history(
        self, update: Update, context: ContextTypes.DEFAULT_TYPE
    ):
        """Handle /cron history command."""
        args = context.args if context.args else []

        if not args:
            await update.effective_message.reply_text(
                f"Usage: `/cron history <job_id>`\n\nList job execution history."
            )
            return

        job_id = args[0]

        # Import cron functions
        from tools.cron_manager import get_job_history, get_cron_job

        job = await asyncio.to_thread(get_cron_job, job_id)
        if not job:
            await update.effective_message.reply_text(f"❌ Job not found: `{job_id}`")
            return

        history = await asyncio.to_thread(get_job_history, job_id, 10)

        message = f"📊 *Job History: {job['name']}*\n\n"

        for h in history:
            status_emoji = {"success": "✅", "failed": "❌", "running": "🔄"}.get(
                h["status"], "?"
            )
            duration = h["duration_seconds"] or 0
            message += (
                f"{status_emoji} `{h['run_id']}`\n"
                f"  Status: {h['status'].upper()} | "
                f"Duration: {duration:.1f}s\n"
                f"  Started: {h['started_at']}\n\n"
            )

        if not history:
            message += "No runs yet."

        await update.effective_message.reply_text(message, parse_mode="Markdown")

    async def cmd_cron_run(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /cron run command - trigger a job immediately."""
        user = update.effective_user

        # Security check
        if user.id != 7700153618:
            await update.effective_message.reply_text(
                "⛔ Only authorized users can run cron jobs."
            )
            return

        args = context.args if context.args else []

        if not args:
            await update.effective_message.reply_text(
                "Usage: `/cron run <job_id>`\n\nTrigger a cron job immediately."
            )
            return

        job_id = args[0]

        # Import cron functions
        from tools.cron_manager import get_cron_job, run_job

        job = await asyncio.to_thread(get_cron_job, job_id)
        if not job:
            await update.effective_message.reply_text(f"❌ Job not found: `{job_id}`")
            return

        await update.effective_message.reply_text(f"🚀 *Running Job: {job['name']}*")

        result = await asyncio.to_thread(run_job, job_id)

        if result["success"]:
            await update.effective_message.reply_text(
                f"✅ *Job Completed*\n\n"
                f"Status: {result['status'].upper()}\n"
                f"Run ID: `{result['run_id']}`"
            )
        else:
            await update.effective_message.reply_text(
                f"❌ *Job Failed*\n\n"
                f"Status: {result['status'].upper()}\n"
                f"Error: {result.get('error', 'N/A')}"
            )

    async def cmd_cron_delete(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /cron delete command."""
        user = update.effective_user

        # Security check
        if user.id != 7700153618:
            await update.effective_message.reply_text(
                "⛔ Only authorized users can delete cron jobs."
            )
            return

        args = context.args if context.args else []

        if not args:
            await update.effective_message.reply_text("Usage: `/cron delete <job_id>`")
            return

        job_id = args[0]

        # Import cron functions
        from tools.cron_manager import get_cron_job, delete_cron_job

        job = await asyncio.to_thread(get_cron_job, job_id)
        if not job:
            await update.effective_message.reply_text(f"❌ Job not found: `{job_id}`")
            return

        success = await asyncio.to_thread(delete_cron_job, job_id)

        if success:
            await update.effective_message.reply_text(
                f"🗑️ *Cron Job Deleted*\n\nJob: {job['name']}\nID: `{job_id}`"
            )
        else:
            await update.effective_message.reply_text(
                f"❌ Failed to delete job: `{job_id}`"
            )

    async def cmd_cron_pause(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /cron pause command."""
        user = update.effective_user

        # Security check
        if user.id != 7700153618:
            await update.effective_message.reply_text(
                "⛔ Only authorized users can pause cron jobs."
            )
            return

        args = context.args if context.args else []

        if not args:
            await update.effective_message.reply_text("Usage: `/cron pause <job_id>`")
            return

        job_id = args[0]

        # Import cron functions
        from tools.cron_manager import get_cron_job, update_cron_job

        job = await asyncio.to_thread(get_cron_job, job_id)
        if not job:
            await update.effective_message.reply_text(f"❌ Job not found: `{job_id}`")
            return

        success = await asyncio.to_thread(update_cron_job, job_id, status="paused")

        if success:
            await update.effective_message.reply_text(
                f"⏸️ *Cron Job Paused*\n\n"
                f"Job: {job['name']}\n"
                f"ID: `{job_id}`\n\n"
                f"Use `/cron resume {job_id}` to re-enable."
            )

    async def cmd_cron_resume(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /cron resume command."""
        user = update.effective_user

        # Security check
        if user.id != 7700153618:
            await update.effective_message.reply_text(
                "⛔ Only authorized users can resume cron jobs."
            )
            return

        args = context.args if context.args else []

        if not args:
            await update.effective_message.reply_text("Usage: `/cron resume <job_id>`")
            return

        job_id = args[0]

        # Import cron functions
        from tools.cron_manager import get_cron_job, update_cron_job

        job = await asyncio.to_thread(get_cron_job, job_id)
        if not job:
            await update.effective_message.reply_text(f"❌ Job not found: `{job_id}`")
            return

        success = await asyncio.to_thread(update_cron_job, job_id, status="active")

        if success:
            await update.effective_message.reply_text(
                f"▶️ *Cron Job Resumed*\n\nJob: {job['name']}\nID: `{job_id}`"
            )

    async def handle_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle incoming text messages with conversation tracking."""
        message = update.message
        user = message.from_user
        chat = message.chat

        # Initialize conversation manager
        from tools.messaging.conversation_manager import get_conversation_manager

        conv_manager = get_conversation_manager()

        # Get or create conversation thread
        chat_id = str(chat.id)
        thread_id = await asyncio.to_thread(
            conv_manager.get_or_create_thread, chat_id=chat_id, user_id=user.id
        )

        # Check if this is a reply to a previous message
        referenced_message = None
        if message.reply_to_message:
            referenced_message = await asyncio.to_thread(
                conv_manager.get_referenced_message,
                thread_id=thread_id,
                reply_to_message_id=message.reply_to_message.message_id,
            )
            self.logger.info(f"Message is reply to: {referenced_message}")

        # Get conversation context
        conv_context = await asyncio.to_thread(
            conv_manager.get_thread_context, thread_id=thread_id
        )

        # Get recent messages for context
        recent_messages = await asyncio.to_thread(
            conv_manager.get_recent_thread_messages, thread_id=thread_id, limit=5
        )

        self.logger.info(
            f"Incoming message from {user.id} ({user.username}): {message.text[:50]} "
            f"[Thread: {thread_id}, Reply: {message.reply_to_message is not None}]"
        )

        # Rate limit check
        if not await self.rate_limiter.wait_for_token():
            self.logger.warning(f"Rate limit exceeded for user {user.id}")
            await message.reply_text("⚠️ Rate limit exceeded. Please slow down.")
            return

        # Check for pending skill confirmation first
        if recent_messages and recent_messages[-1].get("direction") == "outgoing":
            last_msg = recent_messages[-1]["content"]
            if (
                "Reply 'yes' to proceed" in last_msg
                or "Reply 'yes' to confirm" in last_msg
            ):
                msg_lower = message.text.lower().strip()
                if msg_lower in ["yes", "y", "confirm", "proceed"]:
                    # User confirmed - check for pending skill
                    pending = await asyncio.to_thread(
                        conv_manager.get_pending_skill, thread_id=thread_id
                    )
                    if pending:
                        await self._execute_pending_skill(
                            message, conv_manager, thread_id, pending
                        )
                        return
                elif msg_lower in ["no", "n", "cancel", "abort"]:
                    await asyncio.to_thread(
                        conv_manager.clear_pending_skill, thread_id=thread_id
                    )
                    await message.reply_text("❌ Cancelled.")
                    await asyncio.to_thread(
                        conv_manager.add_message_to_thread,
                        thread_id=thread_id,
                        message_id=message.message_id,
                        content=message.text,
                        direction="incoming",
                        reply_to_message_id=message.reply_to_message.message_id
                        if message.reply_to_message
                        else None,
                    )
                    return

        # Check for "build" keyword in natural language
        message_lower = message.text.lower() if message.text else ""
        if "build" in message_lower and user.id == 7700153618:
            # Extract goal name after "build"
            parts = message_lower.split("build", 1)
            if len(parts) > 1:
                potential_goal = parts[1].strip()

                # Validate goal
                available_goals = get_available_goals()
                matched_goal = None

                # Try exact match first
                for goal in available_goals:
                    if potential_goal == goal.lower():
                        matched_goal = goal
                        break

                # Try partial match (contains goal name)
                if not matched_goal:
                    for goal in available_goals:
                        if goal.lower() in potential_goal:
                            matched_goal = goal
                            break

                # If still no match and contains "dashboard" or "app" or "test", use build_app
                if not matched_goal and (
                    "dashboard" in potential_goal
                    or "app" in potential_goal
                    or "test" in potential_goal
                ):
                    matched_goal = "build_app"

                if matched_goal:
                    # Check if user wants Claude Code
                    use_claude = "claude" in message_lower
                    builder = "claude" if use_claude else "opencode"

                    self.logger.info(
                        f"Natural language build detected: {matched_goal} with {builder} (user: {user.id})"
                    )

                    # Add to conversation thread
                    await asyncio.to_thread(
                        conv_manager.add_message_to_thread,
                        thread_id=thread_id,
                        message_id=message.message_id,
                        content=message.text,
                        direction="incoming",
                        reply_to_message_id=message.reply_to_message.message_id
                        if message.reply_to_message
                        else None,
                        skill_used="build_trigger",
                    )

                    await message.reply_text(
                        f"🚀 Starting build: {matched_goal} ({builder.upper()})..."
                    )

                    build_info = await asyncio.to_thread(
                        start_opcode_build, matched_goal, user.id, chat_id, builder
                    )

                    if build_info["success"]:
                        session_id = build_info["session_id"]
                        response_text = (
                            f"✅ Build started!\n\n"
                            f"Session ID: `{session_id}`\n"
                            f"Builder: {builder.upper()}\n\n"
                            f"Use `/status {session_id}` to check progress."
                        )
                        await message.reply_text(response_text)

                        # Store outgoing message
                        await asyncio.to_thread(
                            conv_manager.add_message_to_thread,
                            thread_id=thread_id,
                            message_id=0,
                            content=response_text,
                            direction="outgoing",
                            skill_used="build_trigger",
                        )
                    else:
                        await message.reply_text(
                            f"❌ Failed to start build: {build_info.get('error', 'Unknown error')}"
                        )
                    return

        # Try skill-based intent detection with context
        try:
            from tools.skills.intent_detector import detect_intent
            from tools.skills.skill_parser import parse_skill
            from tools.skills.skill_executor import execute_skill

            # Enhance detection with context
            intent = await asyncio.to_thread(detect_intent, message.text)

            # If low confidence but we have conversation context, try harder
            if (not intent or intent.confidence < 0.7) and conv_context.last_skill:
                # User might be continuing previous conversation
                if referenced_message:
                    # This is a reply - try to understand in context of what they replied to
                    self.logger.info(
                        f"Low confidence intent but message is reply. Context: {conv_context.last_skill}"
                    )

            if intent and intent.confidence >= 0.7:
                self.logger.info(
                    f"Skill detected: {intent.skill_id} (confidence: {intent.confidence:.2f})"
                )

                skill = await asyncio.to_thread(parse_skill, intent.skill_id)

                if skill:
                    # Add incoming message to thread
                    await asyncio.to_thread(
                        conv_manager.add_message_to_thread,
                        thread_id=thread_id,
                        message_id=message.message_id,
                        content=message.text,
                        direction="incoming",
                        reply_to_message_id=message.reply_to_message.message_id
                        if message.reply_to_message
                        else None,
                        skill_used=intent.skill_id,
                    )

                    # Update context with current skill
                    conv_context.last_skill = intent.skill_id
                    await asyncio.to_thread(
                        conv_manager.update_thread_context,
                        thread_id=thread_id,
                        context=conv_context,
                    )

                    # Check safety level for confirmation
                    if (
                        skill.safety_level in ["action", "danger"]
                        and skill.require_confirmation
                    ):
                        await message.reply_text(
                            f"⚠️ This will execute: *{skill.name}*\n\n"
                            f"Safety level: {skill.safety_level.upper()}\n\n"
                            f"Reply 'yes' to proceed or 'no' to cancel."
                        )
                        # Store pending skill
                        await asyncio.to_thread(
                            conv_manager.set_pending_skill,
                            thread_id=thread_id,
                            skill_id=intent.skill_id,
                            parameters=intent.parameters,
                            confirmation_required=True,
                        )
                        return

                    # Execute skill
                    result = await asyncio.to_thread(
                        execute_skill, skill, intent.parameters
                    )

                    if result["success"]:
                        response_text = result["response"]
                        await message.reply_text(response_text, parse_mode="Markdown")

                        # Store outgoing message
                        await asyncio.to_thread(
                            conv_manager.add_message_to_thread,
                            thread_id=thread_id,
                            message_id=0,
                            content=response_text,
                            direction="outgoing",
                            skill_used=intent.skill_id,
                        )
                    else:
                        await message.reply_text(
                            f"❌ Skill execution failed:\n{result.get('error', 'Unknown error')}"
                        )
                    return
        except Exception as e:
            self.logger.error(f"Skill detection error: {e}")
            # Show error to user instead of generic response
            await message.reply_text(
                f"❌ I understood your request but encountered an error:\n`{str(e)[:200]}`\n\n"
                f"Please try again or use /help for available commands."
            )
            return

        # Get or create session
        session_id = await asyncio.to_thread(
            get_or_create_session,
            chat_id=str(chat.id),
            user_id=user.id,
            title=chat.title or f"@{user.username}"
            if user.username
            else f"User {user.id}",
        )

        # Store message in database
        await asyncio.to_thread(
            store_message,
            session_id=session_id,
            message_id=message.message_id,
            direction="incoming",
            content=message.text,
            content_type="text",
            metadata={"username": user.username, "user_id": user.id},
        )

        # Store in memory system
        await self.memory.store_message_as_event(message.text, session_id)

        # Load context and generate response
        if self.config["telegram"]["features"]["send_messages"]:
            context_text = await self.memory.load_context(session_id)

            response = self._generate_response(message.text, context_text)

            # Rate limit check for outgoing
            if await self.rate_limiter.wait_for_token():
                await message.reply_text(response)

                # Store outgoing message
                await asyncio.to_thread(
                    store_message,
                    session_id=session_id,
                    message_id=0,
                    direction="outgoing",
                    content=response,
                    content_type="text",
                )
            else:
                self.logger.warning(f"Rate limit exceeded for outgoing message")
                await message.reply_text(
                    "⚠️ I'm processing too many messages. Please wait."
                )

    async def _execute_pending_skill(
        self, message, conv_manager, thread_id: str, pending: dict
    ):
        """Execute a pending skill after user confirmation."""
        from tools.skills.skill_parser import parse_skill
        from tools.skills.skill_executor import execute_skill

        skill_id = pending["skill_id"]
        parameters = pending["parameters"]

        skill = await asyncio.to_thread(parse_skill, skill_id)

        if skill:
            await asyncio.to_thread(
                conv_manager.clear_pending_skill, thread_id=thread_id
            )

            result = await asyncio.to_thread(execute_skill, skill, parameters)

            if result["success"]:
                response_text = result["response"]
                await message.reply_text(response_text, parse_mode="Markdown")

                await asyncio.to_thread(
                    conv_manager.add_message_to_thread,
                    thread_id=thread_id,
                    message_id=message.message_id,
                    content=message.text,
                    direction="incoming",
                    skill_used=skill_id,
                )

                await asyncio.to_thread(
                    conv_manager.add_message_to_thread,
                    thread_id=thread_id,
                    message_id=0,
                    content=response_text,
                    direction="outgoing",
                    skill_used=skill_id,
                )
            else:
                await message.reply_text(
                    f"❌ Skill execution failed:\n{result.get('error', 'Unknown error')}"
                )

    def _generate_response(self, user_message: str, context: str) -> str:
        """Generate a response to user message using ZAI API."""
        if not self.memory.enabled:
            return f"You said: {user_message}\n\n(AI provider not configured)"

        try:
            import httpx

            if self.memory.use_zai:
                config = self.memory.zai_config
                base_url = config.get("base_url", "")
                api_key = config.get("api_key", "")
                model = config.get("model", "glm-4.7")
                max_tokens = config.get("max_tokens", 1000)

                url = f"{base_url.rstrip('/')}/chat/completions"
            else:
                config = self.memory.openai_config
                api_key = config.get("api_key", "")
                model = config.get("model", "gpt-4o-mini")
                max_tokens = config.get("max_tokens", 1000)
                url = "https://api.openai.com/v1/chat/completions"

            messages = [
                {
                    "role": "system",
                    "content": "You are Atlas, an AI assistant powered by Z.ai's GLM-4.7 model. You help users with tasks, answer questions, and have conversations. Be helpful, friendly, and concise. Never identify yourself as GLM - you are Atlas. RESPOND IN ENGLISH ONLY.",
                }
            ]

            if context and len(context) > 50:
                messages.append(
                    {
                        "role": "system",
                        "content": f"Context from memory system:\n{context}",
                    }
                )

            messages.append({"role": "user", "content": user_message})

            with httpx.Client(timeout=30.0) as client:
                response = client.post(
                    url,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": model,
                        "messages": messages,
                        "max_tokens": max_tokens,
                    },
                )

                response.raise_for_status()
                result = response.json()

                # Extract the response
                if result.get("choices") and len(result["choices"]) > 0:
                    return result["choices"][0]["message"]["content"]
                else:
                    return "Sorry, I couldn't generate a response."

        except Exception as e:
            logging.error(f"Error generating response: {e}")
            return f"Sorry, I encountered an error: {str(e)}"


# ============================================================================
# Signal Handlers and Main Entry Point
# ============================================================================


def signal_handler(daemon: TelegramGatewayDaemon):
    """Handle shutdown signals."""

    def handler():
        daemon.logger.info("Received shutdown signal")
        daemon.shutdown_event.set()

    return handler


async def main():
    """Main entry point."""
    daemon = TelegramGatewayDaemon()

    # Setup signal handlers
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, signal_handler(daemon))

    try:
        # Start daemon
        await daemon.start()

        # Wait for shutdown signal
        await daemon.shutdown_event.wait()

    except Exception as e:
        daemon.logger.error(f"Error in main loop: {e}", exc_info=True)
    finally:
        # Stop daemon
        await daemon.stop()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nShutting down...")
        sys.exit(0)
