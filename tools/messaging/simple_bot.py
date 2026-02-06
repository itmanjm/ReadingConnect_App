#!/usr/bin/env python3
"""
Simple Telegram Bot for Messaging Gateway

Sends and receives messages via Telegram Bot API.
Integrates with existing memory system (tools/memory/).
Uses configuration from args/messaging.yaml.
"""

import os
import sys
import json
from pathlib import Path

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
DB_PATH = PROJECT_ROOT / "data" / "memory.db"
ENV_PATH = PROJECT_ROOT / ".env"


def get_connection():
    """Get database connection."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    return sqlite3.connect(str(DB_PATH))


def send_message(chat_id: str, message: str) -> dict:
    """Send a message to a Telegram chat.

    Args:
        chat_id: Telegram chat ID (from command line)
        message: Message content to send

    Returns:
        dict with success status and message_id
    """
    conn = get_connection()
    cursor = conn.cursor()

    # Store message for daemon to pick up
    cursor.execute(
        """
        INSERT INTO telegram_messages (session_id, message_id, direction, content, content_type, metadata, created_at)
        VALUES (?, ?, 'outgoing', ?, 'text', '{}', CURRENT_TIMESTAMP)
    """,
        (chat_id, 0, message),
    )

    conn.commit()

    return {
        "success": True,
        "message_id": 0,
        "message": f"Message queued: {message[:50]}...",
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(
            'Usage: python simple_bot.py --chat-id <CHAT_ID> --message "Your message"'
        )
        print("\nOptions:")
        print("  --chat-id <ID>    Telegram chat ID (required)")
        print("  --message <TEXT>   Message to send (required)")
        sys.exit(1)

    chat_id = sys.argv[1]
    message = " ".join(sys.argv[2:])

    result = send_message(chat_id, message)

    if result["success"]:
        print(f"✓ Success! Message queued for chat {chat_id[:15]}")
    else:
        print(f"✗ Failed: {result.get('error', 'Unknown error')}")
        sys.exit(1)
