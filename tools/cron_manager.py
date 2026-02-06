#!/usr/bin/env python3
"""
Atlas Cron Job Manager

Schedules and executes cron jobs with history tracking.
Supports shell commands, builds, and goal executions.
"""

import asyncio
import subprocess
import uuid
import shlex
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, Dict, Any
from croniter import croniter

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent
import sys

sys.path.insert(0, str(PROJECT_ROOT))

from tools.messaging.database import get_connection


# ============================================================================
# Database Operations
# ============================================================================


def get_db():
    """Get database connection."""
    return get_connection()


def create_cron_job(
    job_id: str,
    name: str,
    command: str,
    schedule: str,
    job_type: str = "shell",
    goal_name: str = None,
    args: list = None,
    user_id: int = None,
    chat_id: str = None,
) -> bool:
    """Create a new cron job."""
    conn = get_db()
    cursor = conn.cursor()

    try:
        # Calculate next run time
        now = datetime.now()
        cron = croniter(schedule, now)
        next_run = cron.get_next(datetime)

        cursor.execute(
            """
            INSERT INTO cron_jobs (job_id, name, command, schedule, job_type, goal_name, args, user_id, chat_id, next_run_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                job_id,
                name,
                command,
                schedule,
                job_type,
                goal_name,
                str(args) if args else None,
                user_id,
                chat_id,
                next_run,
            ),
        )
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()


def get_cron_job(job_id: str) -> Optional[Dict]:
    """Get a cron job by ID."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM cron_jobs WHERE job_id = ? AND status != 'deleted'", (job_id,)
    )
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None


def list_cron_jobs(user_id: int = None, status: str = "active") -> list:
    """List all cron jobs."""
    conn = get_db()
    cursor = conn.cursor()

    if user_id:
        cursor.execute(
            "SELECT * FROM cron_jobs WHERE user_id = ? AND status = ? ORDER BY created_at DESC",
            (user_id, status),
        )
    else:
        cursor.execute(
            "SELECT * FROM cron_jobs WHERE status = ? ORDER BY created_at DESC",
            (status,),
        )

    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def update_cron_job(
    job_id: str, schedule: str = None, status: str = None, name: str = None
) -> bool:
    """Update a cron job."""
    conn = get_db()
    cursor = conn.cursor()

    updates = []
    params = []

    if schedule:
        updates.append("schedule = ?")
        params.append(schedule)
        # Recalculate next run time
        now = datetime.now()
        cron = croniter(schedule, now)
        next_run = cron.get_next(datetime)
        updates.append("next_run_at = ?")
        params.append(next_run)

    if status:
        updates.append("status = ?")
        params.append(status)

    if name:
        updates.append("name = ?")
        params.append(name)

    if not updates:
        return False

    params.append(job_id)
    cursor.execute(
        f"UPDATE cron_jobs SET {', '.join(updates)}, updated_at = CURRENT_TIMESTAMP WHERE job_id = ?",
        params,
    )
    conn.commit()
    conn.close()
    return cursor.rowcount > 0


def delete_cron_job(job_id: str) -> bool:
    """Soft delete a cron job."""
    return update_cron_job(job_id, status="deleted")


def get_due_jobs() -> list:
    """Get all jobs that are due to run."""
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()

    cursor.execute(
        """
        SELECT * FROM cron_jobs
        WHERE status = 'active' AND next_run_at <= ?
        ORDER BY next_run_at ASC
        """,
        (now,),
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def update_job_run_time(job_id: str):
    """Update next run time based on schedule."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT schedule FROM cron_jobs WHERE job_id = ?", (job_id,))
    row = cursor.fetchone()
    if row:
        schedule = row["schedule"]
        now = datetime.now()
        cron = croniter(schedule, now)
        next_run = cron.get_next(datetime)
        cursor.execute(
            "UPDATE cron_jobs SET next_run_at = ?, last_run_at = ? WHERE job_id = ?",
            (next_run, now, job_id),
        )
    conn.commit()
    conn.close()


# ============================================================================
# Job History
# ============================================================================


def log_job_start(job_id: str) -> str:
    """Log the start of a job and return run_id."""
    run_id = f"run_{datetime.now().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:8]}"
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO cron_job_history (job_id, run_id, status, started_at)
        VALUES (?, ?, 'running', CURRENT_TIMESTAMP)
        """,
        (job_id, run_id),
    )
    conn.commit()
    conn.close()
    return run_id


def log_job_complete(
    run_id: str,
    status: str,
    output: str = None,
    error: str = None,
    exit_code: int = None,
):
    """Log job completion."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        UPDATE cron_job_history
        SET status = ?, completed_at = CURRENT_TIMESTAMP,
            duration_seconds = (
                SELECT (julianday(CURRENT_TIMESTAMP) - julianday(started_at)) * 86400.0
                FROM cron_job_history WHERE run_id = ?
            ),
            output = ?, error_message = ?, exit_code = ?
        WHERE run_id = ?
        """,
        (status, run_id, output, error, exit_code, run_id),
    )
    conn.commit()
    conn.close()


def get_job_history(job_id: str, limit: int = 10) -> list:
    """Get job execution history."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT * FROM cron_job_history
        WHERE job_id = ?
        ORDER BY started_at DESC
        LIMIT ?
        """,
        (job_id, limit),
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def log_notification(job_id: str, run_id: str, message: str):
    """Log a notification that was sent."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO cron_notifications (job_id, run_id, message)
        VALUES (?, ?, ?)
        """,
        (job_id, run_id, message),
    )
    conn.commit()
    conn.close()


# ============================================================================
# Job Execution
# ============================================================================


def execute_shell_command(command: str) -> tuple:
    """Execute a shell command and return (exit_code, stdout, stderr)."""
    try:
        proc = subprocess.Popen(
            command,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        stdout, stderr = proc.communicate(timeout=300)  # 5 min timeout
        return proc.returncode, stdout, stderr
    except subprocess.TimeoutExpired:
        proc.kill()
        return -1, "", "Timeout: Command exceeded 5 minutes"
    except Exception as e:
        return -1, "", str(e)


def run_job(job_id: str, chat_id: str = None) -> Dict[str, Any]:
    """Run a cron job and log results."""
    job = get_cron_job(job_id)
    if not job:
        return {"success": False, "error": "Job not found"}

    run_id = log_job_start(job_id)
    output = ""
    error = None
    exit_code = 0

    try:
        if job["job_type"] == "shell":
            # Execute shell command
            exit_code, stdout, stderr = execute_shell_command(job["command"])
            output = stdout
            if stderr:
                output += f"\n[STDERR]\n{stderr}"
            status = "success" if exit_code == 0 else "failed"

        elif job["job_type"] in ("build", "goal"):
            # Run via OpenCode or Claude
            goal_name = job["goal_name"]
            builder = "opencode" if job["job_type"] == "build" else "claude"

            # Import and run build
            from tools.messaging.daemon import start_opcode_build

            result = start_opcode_build(goal_name, job["user_id"], chat_id, builder)
            if result["success"]:
                output = f"Build started: {result['session_id']}\nPID: {result.get('pid', 'N/A')}"
                status = "success"
            else:
                output = ""
                error = result.get("error", "Unknown error")
                status = "failed"
                exit_code = 1
        else:
            error = f"Unknown job type: {job['job_type']}"
            status = "failed"
            exit_code = 1

    except Exception as e:
        error = str(e)
        status = "failed"
        exit_code = 1

    # Log completion
    log_job_complete(run_id, status, output, error, exit_code)

    # Update job next run time
    update_job_run_time(job_id)

    return {
        "success": status == "success",
        "run_id": run_id,
        "status": status,
        "output": output,
        "error": error,
    }


# ============================================================================
# Scheduler (runs in background)
# ============================================================================


class CronScheduler:
    """Background scheduler for cron jobs."""

    def __init__(self, check_interval: int = 60):
        self.check_interval = check_interval
        self.running = False
        self._task = None

    async def start(self):
        """Start the scheduler."""
        self.running = True
        self._task = asyncio.create_task(self._run_loop())

    async def stop(self):
        """Stop the scheduler."""
        self.running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

    async def _run_loop(self):
        """Main scheduling loop."""
        while self.running:
            try:
                due_jobs = get_due_jobs()
                for job in due_jobs:
                    # Run job in background
                    asyncio.create_task(self._run_job_async(job))

                # Sleep until next check
                await asyncio.sleep(self.check_interval)
            except Exception as e:
                print(f"Scheduler error: {e}")
                await asyncio.sleep(self.check_interval)

    async def _run_job_async(self, job: Dict):
        """Run a job asynchronously and send notification."""
        chat_id = job.get("chat_id")

        # Import here to avoid circular imports
        from tools.cron_manager import run_job

        result = run_job(job["job_id"], chat_id)

        # Send notification if chat_id is available
        if chat_id:
            try:
                from telegram import Bot

                # Get bot token from config
                from tools.messaging.daemon import config

                bot = Bot(token=config["telegram"]["bot_token"])

                if result["success"]:
                    message = f"✅ *Cron Job Completed*\n\n*Job:* {job['name']}\n*Status:* Success\n*Run ID:* `{result['run_id']}`"
                else:
                    message = f"❌ *Cron Job Failed*\n\n*Job:* {job['name']}\n*Status:* Failed\n*Error:* {result.get('error', 'Unknown')}\n*Run ID:* `{result['run_id']}`"

                bot.send_message(chat_id=chat_id, text=message, parse_mode="Markdown")

                log_notification(
                    job["job_id"],
                    result["run_id"],
                    message,
                )
            except Exception as e:
                print(f"Failed to send notification: {e}")


# ============================================================================
# Utility Functions
# ============================================================================


def generate_job_id(name: str) -> str:
    """Generate a unique job ID from a name."""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    safe_name = "".join(
        c for c in name.lower().replace(" ", "_") if c.isalnum() or c == "_"
    )
    return f"job_{safe_name}_{timestamp}"


def parse_schedule(schedule: str) -> Dict[str, Any]:
    """Parse a cron schedule and return human-readable info."""
    try:
        now = datetime.now()
        cron = croniter(schedule, now)

        next_run = cron.get_next(datetime)
        prev_run = cron.get_prev(datetime)

        return {
            "valid": True,
            "next_run": next_run.isoformat(),
            "prev_run": prev_run.isoformat(),
            "human": f"At {next_run.hour:02d}:{next_run.minute:02d} on "
            f"{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][next_run.weekday()]}",
        }
    except Exception as e:
        return {"valid": False, "error": str(e)}


# ============================================================================
# Main
# ============================================================================


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Atlas Cron Manager")
    parser.add_argument(
        "action",
        choices=["list", "create", "run", "history", "delete", "pause", "resume"],
    )
    parser.add_argument("--job_id", help="Job ID")
    parser.add_argument("--name", help="Job name")
    parser.add_argument("--command", help="Command to run")
    parser.add_argument("--schedule", help="Cron schedule")
    parser.add_argument("--type", default="shell", choices=["shell", "build", "goal"])
    parser.add_argument("--goal", help="Goal name (for build/goal type)")
    parser.add_argument("--user_id", type=int, help="Telegram user ID")
    parser.add_argument("--chat_id", help="Telegram chat ID")
    parser.add_argument("--limit", type=int, default=10, help="History limit")

    args = parser.parse_args()

    if args.action == "list":
        jobs = list_cron_jobs(status="active")
        for job in jobs:
            print(
                f"{job['job_id']}: {job['name']} ({job['schedule']}) - {job['status']}"
            )

    elif args.action == "create":
        job_id = generate_job_id(args.name)
        success = create_cron_job(
            job_id=job_id,
            name=args.name,
            command=args.command,
            schedule=args.schedule,
            job_type=args.type,
            goal_name=args.goal,
            user_id=args.user_id,
            chat_id=args.chat_id,
        )
        print(f"Job created: {job_id}" if success else "Failed to create job")

    elif args.action == "run":
        if args.job_id:
            result = run_job(args.job_id)
            print(f"Status: {result['status']}")
            print(f"Output: {result.get('output', 'N/A')}")

    elif args.action == "history":
        if args.job_id:
            history = get_job_history(args.job_id, args.limit)
            for h in history:
                print(
                    f"{h['started_at']}: {h['status']} - {h['duration_seconds']:.1f}s"
                )

    elif args.action == "delete":
        if args.job_id:
            success = delete_cron_job(args.job_id)
            print(f"Deleted: {success}")

    elif args.action == "pause":
        if args.job_id:
            success = update_cron_job(args.job_id, status="paused")
            print(f"Paused: {success}")

    elif args.action == "resume":
        if args.job_id:
            success = update_cron_job(args.job_id, status="active")
            print(f"Resumed: {success}")
