#!/usr/bin/env python3
"""
Conversation Manager

Tracks conversation threads, maintains context across messages,
and handles reply-to-message references.
"""

import json
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any
from dataclasses import dataclass

from tools.messaging.database import get_connection


@dataclass
class ConversationContext:
    """Context data for a conversation thread."""

    last_skill: Optional[str] = None
    pending_skill: Optional[Dict] = None
    topic: Optional[str] = None
    extracted_entities: Dict = None
    user_preferences: Dict = None

    def __post_init__(self):
        if self.extracted_entities is None:
            self.extracted_entities = {}
        if self.user_preferences is None:
            self.user_preferences = {}

    def to_dict(self) -> Dict:
        return {
            "last_skill": self.last_skill,
            "pending_skill": self.pending_skill,
            "topic": self.topic,
            "extracted_entities": self.extracted_entities,
            "user_preferences": self.user_preferences,
        }

    @classmethod
    def from_dict(cls, data: Dict) -> "ConversationContext":
        return cls(
            last_skill=data.get("last_skill"),
            pending_skill=data.get("pending_skill"),
            topic=data.get("topic"),
            extracted_entities=data.get("extracted_entities", {}),
            user_preferences=data.get("user_preferences", {}),
        )


class ConversationManager:
    """Manages conversation threads and context."""

    def __init__(self):
        self._cache = {}

    def get_or_create_thread(
        self, chat_id: str, user_id: int, topic: str = None
    ) -> str:
        """Get existing active thread or create new one."""
        conn = get_connection()
        cursor = conn.cursor()

        # Look for recent active thread (within last 30 minutes)
        thirty_mins_ago = (datetime.now() - timedelta(minutes=30)).isoformat()
        cursor.execute(
            """
            SELECT thread_id FROM conversation_threads
            WHERE chat_id = ? AND user_id = ? AND is_active = TRUE
            AND last_message_at > ?
            ORDER BY last_message_at DESC
            LIMIT 1
            """,
            (chat_id, user_id, thirty_mins_ago),
        )

        row = cursor.fetchone()
        if row:
            thread_id = row["thread_id"]
            # Update last_message_at
            cursor.execute(
                "UPDATE conversation_threads SET last_message_at = CURRENT_TIMESTAMP WHERE thread_id = ?",
                (thread_id,),
            )
            conn.commit()
            conn.close()
            return thread_id

        # Create new thread
        thread_id = f"thread_{uuid.uuid4().hex[:12]}"
        cursor.execute(
            """
            INSERT INTO conversation_threads (thread_id, chat_id, user_id, topic)
            VALUES (?, ?, ?, ?)
            """,
            (thread_id, chat_id, user_id, topic),
        )
        conn.commit()
        conn.close()

        return thread_id

    def add_message_to_thread(
        self,
        thread_id: str,
        message_id: int,
        content: str,
        direction: str,
        reply_to_message_id: int = None,
        skill_used: str = None,
    ):
        """Add a message to a thread."""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO thread_messages
            (thread_id, message_id, reply_to_message_id, content, direction, skill_used)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                thread_id,
                message_id,
                reply_to_message_id,
                content,
                direction,
                skill_used,
            ),
        )

        # Update thread's last_message_at
        cursor.execute(
            "UPDATE conversation_threads SET last_message_at = CURRENT_TIMESTAMP WHERE thread_id = ?",
            (thread_id,),
        )

        conn.commit()
        conn.close()

    def get_thread_context(self, thread_id: str) -> ConversationContext:
        """Get context data for a thread."""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT context_data FROM conversation_threads WHERE thread_id = ?",
            (thread_id,),
        )
        row = cursor.fetchone()
        conn.close()

        if row and row["context_data"]:
            try:
                data = json.loads(row["context_data"])
                return ConversationContext.from_dict(data)
            except json.JSONDecodeError:
                pass

        return ConversationContext()

    def update_thread_context(self, thread_id: str, context: ConversationContext):
        """Update context data for a thread."""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "UPDATE conversation_threads SET context_data = ? WHERE thread_id = ?",
            (json.dumps(context.to_dict()), thread_id),
        )

        conn.commit()
        conn.close()

    def get_referenced_message(
        self, thread_id: str, reply_to_message_id: int
    ) -> Optional[Dict]:
        """Get the message that was replied to."""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT content, direction, skill_used, created_at
            FROM thread_messages
            WHERE thread_id = ? AND message_id = ?
            """,
            (thread_id, reply_to_message_id),
        )

        row = cursor.fetchone()
        conn.close()

        if row:
            return dict(row)
        return None

    def get_recent_thread_messages(self, thread_id: str, limit: int = 10) -> List[Dict]:
        """Get recent messages in a thread."""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT content, direction, skill_used, created_at
            FROM thread_messages
            WHERE thread_id = ?
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (thread_id, limit),
        )

        rows = cursor.fetchall()
        conn.close()

        return [dict(row) for row in reversed(rows)]

    def set_pending_skill(
        self,
        thread_id: str,
        skill_id: str,
        parameters: Dict,
        confirmation_required: bool = True,
    ):
        """Set a pending skill that needs confirmation."""
        context = self.get_thread_context(thread_id)
        context.pending_skill = {
            "skill_id": skill_id,
            "parameters": parameters,
            "confirmation_required": confirmation_required,
            "timestamp": datetime.now().isoformat(),
        }
        self.update_thread_context(thread_id, context)

    def get_pending_skill(self, thread_id: str) -> Optional[Dict]:
        """Get pending skill if exists and not expired."""
        context = self.get_thread_context(thread_id)

        if context.pending_skill:
            # Check if not expired (5 minutes)
            timestamp = datetime.fromisoformat(context.pending_skill["timestamp"])
            if datetime.now() - timestamp < timedelta(minutes=5):
                return context.pending_skill
            else:
                # Clear expired pending skill
                context.pending_skill = None
                self.update_thread_context(thread_id, context)

        return None

    def clear_pending_skill(self, thread_id: str):
        """Clear pending skill after execution or cancellation."""
        context = self.get_thread_context(thread_id)
        context.pending_skill = None
        self.update_thread_context(thread_id, context)

    def close_thread(self, thread_id: str):
        """Mark thread as inactive."""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "UPDATE conversation_threads SET is_active = FALSE WHERE thread_id = ?",
            (thread_id,),
        )

        conn.commit()
        conn.close()


# Global instance
_manager = None


def get_conversation_manager() -> ConversationManager:
    """Get or create global conversation manager."""
    global _manager
    if _manager is None:
        _manager = ConversationManager()
    return _manager
