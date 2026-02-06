#!/usr/bin/env python3
"""
Telegram Client CLI Tool

Commands:
  list        - List active Telegram sessions
  send        - Send message to session
  history     - Get session message history
  stats       - Get conversation statistics
  close       - Close a session
"""

import argparse
import sys
import json
from pathlib import Path
import sqlite3
from typing import Optional, List
from datetime import datetime

# Paths
DB_PATH = Path(__file__).parent.parent.parent / "data" / "memory.db"
SESSIONS_TABLE = "telegram_sessions"
MESSAGES_TABLE = "telegram_messages"


def get_connection():
    """Get database connection."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    return sqlite3.connect(str(DB_PATH))


def list_sessions(args) -> None:
    """List all active Telegram sessions."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            id,
            telegram_chat_id,
            title,
            message_count,
            last_message_at,
            created_at
        FROM telegram_sessions
        WHERE is_active = TRUE
        ORDER BY last_message_at DESC
    """)

    sessions = cursor.fetchall()

    if args.json:
        # JSON output
        output = []
        for session in sessions:
            output.append(
                {
                    "session_id": session[0],
                    "chat_id": session[1],
                    "title": session[2],
                    "message_count": session[3],
                    "last_message_at": session[4],
                    "created_at": session[5],
                }
            )
        print(json.dumps(output, indent=2))
    else:
        # Human-readable output
        if not sessions:
            print("No active sessions found.")
            return

        print(f"Active Sessions ({len(sessions)}):")
        for session in sessions:
            print(
                f"  [{session[0]:3d}] {session[1]:30s} | {session[2]:10s} | {session[3]} msgs | Last: {session[4]}"
            )


def send_message(args) -> None:
    """Send a message to a Telegram session."""
    if not args.chat_id:
        print("Error: --chat-id is required")
        sys.exit(1)

    if not args.message:
        print("Error: --message is required")
        sys.exit(1)

    # Store in database (eventually gateway will pick this up)
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO telegram_messages (session_id, message_id, direction, content, content_type, metadata, created_at)
        VALUES (?, ?, 'outgoing', ?, 'text', '{}', CURRENT_TIMESTAMP)
    """,
        (args.chat_id, args.message),
    )

    conn.commit()
    print(
        f"Message queued for chat_id {args.chat_id}. Session ID: {args.chat_id[:15]}..."
    )


def get_history(args) -> None:
    """Get message history for a session."""
    if not args.chat_id:
        print("Error: --chat-id is required")
        sys.exit(1)

    if args.limit:
        try:
            args.limit = int(args.limit)
        except ValueError:
            print("Error: --limit must be a number")
            sys.exit(1)

    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT id, message_id, direction, content, content_type, created_at FROM telegram_messages WHERE session_id = ? ORDER BY created_at DESC"
    params = [args.chat_id]

    if args.limit:
        query += " LIMIT ?"
        params.append(args.limit)

    cursor.execute(query, params)
    messages = cursor.fetchall()

    if args.json:
        # JSON output
        output = []
        for msg in messages:
            output.append(
                {
                    "message_id": msg[0],
                    "direction": msg[2],
                    "content": msg[3],
                    "type": msg[4],
                    "created_at": msg[5],
                }
            )
        print(json.dumps(output, indent=2))
    else:
        # Human-readable output
        if not messages:
            print(f"No messages found for session {args.chat_id}")
            return

        print(f"Message History for {args.chat_id}:")
        for msg in messages:
            direction_icon = "→" if msg[2] == "outgoing" else "←"
            print(f"  [{msg[0]:6d}] {msg[2]:6s} | {direction_icon} {msg[3]}")


def get_stats(args) -> None:
    """Get conversation statistics for a session."""
    if not args.chat_id:
        print("Error: --chat-id is required")
        sys.exit(1)

    conn = get_connection()
    cursor = conn.cursor()

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
        (args.chat_id,),
    )

    stats = cursor.fetchall()

    if args.json:
        # JSON output
        output = []
        for stat in stats:
            output.append({"direction": stat[0], "type": stat[1], "count": stat[2]})
        print(json.dumps(output, indent=2))
    else:
        # Human-readable output
        if not stats:
            print(f"No statistics available for session {args.chat_id}")
            return

        print(f"Statistics for {args.chat_id}:")
        current_direction = None
        for stat in stats:
            if stat[0] != current_direction:
                current_direction = stat[0]
                print(f"\n{stat[0].upper()}:")

            print(f"  {stat[1]:12s} ({stat[2]} messages)")


def close_session(args) -> None:
    """Close a Telegram session."""
    if not args.chat_id:
        print("Error: --chat-id is required")
        sys.exit(1)

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE telegram_sessions
        SET is_active = FALSE,
            updated_at = CURRENT_TIMESTAMP
        WHERE telegram_chat_id = ?
    """,
        (args.chat_id,),
    )

    conn.commit()
    print(f"Session {args.chat_id[:15]} closed.")


def main():
    parser = argparse.ArgumentParser(
        description="Telegram Client CLI for messaging gateway",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )

    subparsers = parser.add_subparsers(dest="command", help="Command to execute")

    # list command
    list_parser = subparsers.add_parser("list", help="List active sessions")
    list_parser.set_defaults(func=list_sessions)

    # send command
    send_parser = subparsers.add_parser("send", help="Send a message")
    send_parser.add_argument("--chat-id", required=True, help="Telegram chat ID")
    send_parser.add_argument("--message", required=True, help="Message content")
    send_parser.set_defaults(func=send_message)

    # history command
    history_parser = subparsers.add_parser("history", help="Get session history")
    history_parser.add_argument("--chat-id", required=True, help="Telegram chat ID")
    history_parser.add_argument(
        "--limit", type=int, help="Limit number of messages (default: 10)"
    )
    history_parser.set_defaults(func=get_history)

    # stats command
    stats_parser = subparsers.add_parser("stats", help="Get session statistics")
    stats_parser.add_argument("--chat-id", required=True, help="Telegram chat ID")
    stats_parser.set_defaults(func=get_stats)

    # close command
    close_parser = subparsers.add_parser("close", help="Close a session")
    close_parser.add_argument("--chat-id", required=True, help="Telegram chat ID")
    close_parser.set_defaults(func=close_session)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
