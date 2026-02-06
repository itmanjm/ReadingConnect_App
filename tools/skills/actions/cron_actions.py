#!/usr/bin/env python3
"""
Cron Actions for Skills

Actions for creating and managing cron jobs via skills.
"""

import sys
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from tools.cron_manager import (
    create_cron_job,
    generate_job_id,
    parse_schedule,
    get_cron_job,
)


def parse_interval_to_cron(interval: str) -> str:
    """
    Convert natural language interval to cron expression.

    Args:
        interval: Natural language (e.g., "every hour", "daily")

    Returns:
        Cron expression string
    """
    interval_lower = interval.lower().strip()

    # Hourly patterns
    if interval_lower in ["hourly", "every hour", "every 1 hour"]:
        return "0 * * * *"  # At minute 0 of every hour

    if "every" in interval_lower and "hour" in interval_lower:
        # Extract number: "every 6 hours" -> 6
        import re

        match = re.search(r"(\d+)", interval_lower)
        if match:
            hours = int(match.group(1))
            if hours == 1:
                return "0 * * * *"
            return f"0 */{hours} * * *"  # At minute 0, every N hours

    # Daily patterns
    if interval_lower in ["daily", "every day", "everyday"]:
        return "0 2 * * *"  # At 2 AM daily

    if interval_lower in ["every morning", "morning"]:
        return "0 8 * * *"  # At 8 AM

    if interval_lower in ["every evening", "evening"]:
        return "0 18 * * *"  # At 6 PM

    if interval_lower in ["midnight", "every midnight"]:
        return "0 0 * * *"  # At midnight

    # Weekly patterns
    if interval_lower in ["weekly", "every week"]:
        return "0 2 * * 0"  # Sunday at 2 AM

    if "monday" in interval_lower:
        return "0 8 * * 1"  # Monday at 8 AM

    if "friday" in interval_lower:
        return "0 17 * * 5"  # Friday at 5 PM

    # Minutes
    if "minute" in interval_lower:
        import re

        match = re.search(r"(\d+)", interval_lower)
        if match:
            mins = int(match.group(1))
            return f"*/{mins} * * * *"  # Every N minutes

    # If it looks like a cron expression already, return it
    if len(interval_lower.split()) == 5:
        return interval_lower

    # Default to daily
    return "0 2 * * *"


def infer_command_from_task(task: str, chat_id: str = None) -> tuple:
    """
    Infer command and job type from task description.

    Returns:
        (command, job_type, goal_name)
    """
    task_lower = task.lower()

    # Network monitoring
    if any(kw in task_lower for kw in ["network", "ping", "connectivity", "internet"]):
        # Use enhanced network monitor with Telegram notifications
        cmd = f"python tools/network_monitor.py"
        if chat_id:
            cmd += f" --chat-id {chat_id}"
        return (cmd, "shell", None)

    # YouTube monitoring
    if any(kw in task_lower for kw in ["youtube", "channel", "video"]):
        return ("build youtube_monitoring", "build", "youtube_monitoring")

    # Backup
    if any(kw in task_lower for kw in ["backup", "save"]):
        return ("python tools/backup.py", "shell", None)

    # Build tasks
    if any(kw in task_lower for kw in ["build", "dashboard", "app"]):
        # Extract what to build
        if "dashboard" in task_lower:
            return ("build build_app", "build", "build_app")
        return (
            f"build {task_lower.replace(' ', '_')}",
            "build",
            task_lower.replace(" ", "_"),
        )

    # System monitoring
    if any(kw in task_lower for kw in ["system", "status", "health", "monitor"]):
        return ("python tools/system_monitor.py", "shell", None)

    # Default - assume it's a goal name
    return (
        f"build {task_lower.replace(' ', '_')}",
        "build",
        task_lower.replace(" ", "_"),
    )


def create_job_from_natural_language(
    task: str,
    interval: str = "daily",
    command: str = None,
    user_id: int = None,
    chat_id: str = None,
) -> dict:
    """
    Create a cron job from natural language description.

    Args:
        task: Description of what to do
        interval: How often (natural language)
        command: Specific command (optional)
        user_id: Telegram user ID
        chat_id: Telegram chat ID

    Returns:
        Result dict with success status and job details
    """
    try:
        # Parse interval to cron
        cron_schedule = parse_interval_to_cron(interval)

        # Validate schedule
        schedule_info = parse_schedule(cron_schedule)
        if not schedule_info.get("valid"):
            return {"success": False, "error": f"Invalid schedule: {interval}"}

        # Infer command if not provided
        if not command:
            command, job_type, goal_name = infer_command_from_task(task, chat_id)
        else:
            job_type = "shell"
            goal_name = None

        # Generate job ID
        job_id = generate_job_id(task.replace(" ", "_")[:20])

        # Create the job
        success = create_cron_job(
            job_id=job_id,
            name=task[:50],  # Limit name length
            command=command,
            schedule=cron_schedule,
            job_type=job_type,
            goal_name=goal_name,
            user_id=user_id,
            chat_id=chat_id,
        )

        if success:
            # Get the created job to return details
            job = get_cron_job(job_id)

            return {
                "success": True,
                "job_id": job_id,
                "job_name": task[:50],
                "schedule": cron_schedule,
                "command": command,
                "interval": interval,
                "next_run": schedule_info.get("human", "Unknown"),
                "job_type": job_type,
            }
        else:
            return {
                "success": False,
                "error": "Failed to create job (may already exist)",
            }

    except Exception as e:
        return {"success": False, "error": str(e)}
