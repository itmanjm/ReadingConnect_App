#!/usr/bin/env python3
"""
Memory Actions for Skills

Actions that operate on the memory system.
"""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from tools.memory.hybrid_search import hybrid_search as _hybrid_search


def search_memory(query: str, limit: int = 10, entry_type: str = None):
    """
    Search memory using hybrid search.

    Args:
        query: Search query string
        limit: Maximum results to return
        entry_type: Optional filter by entry type

    Returns:
        List of memory entries with scores
    """
    try:
        results = _hybrid_search(query, top_k=limit)

        # Format results
        formatted = []
        for result in results:
            entry = {
                "content": result.get("content", ""),
                "entry_type": result.get("entry_type", "unknown"),
                "score": result.get("score", 0.0),
                "created_at": result.get("created_at", ""),
            }

            # Filter by type if specified
            if entry_type and entry["entry_type"] != entry_type:
                continue

            formatted.append(entry)

        return formatted
    except Exception as e:
        return {"error": str(e), "results": []}


def add_memory(content: str, entry_type: str = "fact", importance: int = 5):
    """
    Add a new memory entry.

    Args:
        content: Content to remember
        entry_type: Type of memory (fact, event, preference, etc.)
        importance: Importance score (1-10)

    Returns:
        Success status
    """
    try:
        from tools.memory.memory_write import write_memory

        write_memory(content=content, entry_type=entry_type, importance=importance)
        return {"success": True, "message": "Memory added"}
    except Exception as e:
        return {"success": False, "error": str(e)}
