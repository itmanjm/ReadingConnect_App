#!/usr/bin/env python3
"""
Date Reminder Tool for Memory System

Retrieves upcoming dates from memory and generates reminders.
Supports birthdays, anniversaries, and other milestone dates.
"""

import sys
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Any

# Paths
PROJECT_ROOT = Path(__file__).parent.parent.parent
DB_PATH = PROJECT_ROOT / "data" / "memory.db"


def get_connection():
    """Get database connection."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    return sqlite3.connect(str(DB_PATH))


def load_upcoming_events(days_ahead: int = 30) -> List[Dict[str, Any]]:
    """Load events from memory that are upcoming within specified days."""
    conn = get_connection()
    cursor = conn.cursor()

    today = datetime.now().date()
    future_date = today + timedelta(days=days_ahead)

    # Query for events with dates in content
    # This assumes dates are in format like "April 22" or "Jan 28"
    cursor.execute(
        """
        SELECT id, content, entry_type, created_at
        FROM memory_entries
        WHERE entry_type IN ('event', 'fact')
        ORDER BY created_at DESC
        LIMIT 100
    """
    )

    entries = cursor.fetchall()
    conn.close()

    # Parse dates from entries
    upcoming = []

    for entry in entries:
        entry_id, content, entry_type, created_at_str = entry

        # Try to extract date from content
        # Look for patterns like "April 22", "Jan 28", "December 25"
        months = {
            "january": 1,
            "jan": 1,
            "february": 2,
            "feb": 2,
            "march": 3,
            "mar": 3,
            "april": 4,
            "apr": 4,
            "may": 5,
            "may": 5,
            "june": 6,
            "jun": 6,
            "july": 7,
            "jul": 7,
            "august": 8,
            "aug": 8,
            "september": 9,
            "sep": 9,
            "october": 10,
            "oct": 10,
            "november": 11,
            "nov": 11,
            "december": 12,
            "dec": 12,
        }

        date_found = None

        # Search for month names and day numbers
        content_lower = content.lower()
        for month_name, month_num in months.items():
            if month_name in content_lower:
                # Extract day number
                import re

                day_match = re.search(r"\b(\d{1,2})\b", content)
                if day_match:
                    day = int(day_match.group(1))
                    year = datetime.now().year

                    # If date has passed, use next year
                    event_date = datetime(year, month_num, day).date()
                    if event_date < today:
                        event_date = datetime(year + 1, month_num, day).date()

                    date_found = event_date
                    days_until = (date_found - today).days

                    upcoming.append(
                        {
                            "id": entry_id,
                            "content": content,
                            "entry_type": entry_type,
                            "date": date_found,
                            "days_until": days_until,
                        }
                    )

    # Sort by days until
    upcoming.sort(key=lambda x: x["days_until"])

    return upcoming


def generate_reminders(
    upcoming_events: List[Dict[str, Any]], reminder_days: int = 7
) -> List[Dict[str, Any]]:
    """Generate reminder entries for events within reminder days."""
    reminders = []

    for event in upcoming_events:
        if event["days_until"] <= reminder_days:
            reminder_text = f"{event['days_until']} days until: {event['content']}"
            reminders.append(
                {
                    "type": "reminder",
                    "content": reminder_text,
                    "source": "date_reminder_tool",
                    "importance": 5,
                }
            )

    return reminders


def store_reminders_as_tasks(reminders: List[Dict[str, Any]]) -> bool:
    """Store reminders as 'task' type entries in memory."""
    try:
        import subprocess

        sys.path.insert(0, str(PROJECT_ROOT / "tools" / "memory"))

        success_count = 0
        for reminder in reminders:
            result = subprocess.run(
                [
                    sys.executable,
                    str(PROJECT_ROOT / "tools" / "memory" / "memory_write.py"),
                    "--content",
                    reminder["content"],
                    "--type",
                    "task",
                    "--source",
                    reminder["source"],
                ],
                capture_output=True,
                text=True,
            )

            if result.returncode == 0:
                success_count += 1
            else:
                print(f"Failed to store reminder: {reminder}")

        print(f"Stored {success_count}/{len(reminders)} reminders as tasks")
        return success_count > 0

    except Exception as e:
        print(f"Error storing reminders: {e}")
        return False


def list_upcoming(days_ahead: int = 30):
    """List upcoming events."""
    upcoming = load_upcoming_events(days_ahead)

    if not upcoming:
        print("No upcoming events found in memory.")
        return

    print(f"\nUpcoming Events (next {days_ahead} days):")
    print("=" * 60)

    for event in upcoming:
        date_str = event["date"].strftime("%B %d, %Y (%A)")
        days_str = f"{event['days_until']} days" if event["days_until"] > 0 else "Today"

        print(f"📅 {date_str} ({days_str})")
        print(f"   {event['content']}")

    print("=" * 60)
    print(f"\nTotal: {len(upcoming)} events")


def generate_check_ins(days_ahead: int = 30):
    """Generate check-in prompts for relationships."""
    today = datetime.now()

    # Generate weekly check-in prompt
    week_later = today + timedelta(days=7)
    check_in_date = week_later.strftime("%B %d, %Y")

    check_in_prompt = f"Weekly check-in for {check_in_date}: How's the marriage going? Any concerns I should know about? How can I support you and the family better this week?"

    print(f"\n📝 Weekly Check-in Prompt Generated:")
    print("-" * 60)
    print(check_in_prompt)
    print("-" * 60)


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: python3 tools/memory/date_reminder.py [command]")
        print("\nCommands:")
        print("  list    - List upcoming events (default: 30 days)")
        print("  remind  - Generate and store reminders as tasks")
        print("  checkin  - Generate weekly check-in prompt")
        print("  all     - List events + generate reminders + check-in")
        print("\nOptions:")
        print("  --days N - Look ahead N days (default: 30)")
        return 1

    command = sys.argv[1]
    days_ahead = 30

    # Parse --days option
    for i in range(2, len(sys.argv)):
        arg = sys.argv[i]
        if arg == "--days" and i + 1 < len(sys.argv):
            try:
                days_ahead = int(sys.argv[i + 1])
                break
            except ValueError:
                print(f"Error: --days requires a number")
                return 1

    if command == "list":
        list_upcoming(days_ahead)

    elif command == "remind":
        print("Loading upcoming events...")
        upcoming = load_upcoming_events(days_ahead)
        print(f"Found {len(upcoming)} events")

        print("Generating reminders (7 days before each event)...")
        reminders = generate_reminders(upcoming, reminder_days=7)

        print("Storing reminders as tasks in memory...")
        if store_reminders_as_tasks(reminders):
            print("✅ Reminders stored successfully")
        else:
            print("❌ Failed to store reminders")

    elif command == "checkin":
        print("Generating weekly check-in prompt...")
        generate_check_ins(days_ahead)

    elif command == "all":
        list_upcoming(days_ahead)
        print()

        print("Generating and storing reminders...")
        upcoming = load_upcoming_events(days_ahead)
        reminders = generate_reminders(upcoming, reminder_days=7)

        if store_reminders_as_tasks(reminders):
            print("✅ Reminders stored successfully")
        else:
            print("❌ Failed to store reminders")

        print()
        generate_check_ins(days_ahead)

    else:
        print(f"Unknown command: {command}")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
