#!/usr/bin/env python3
"""
Database Actions for Skills

Read-only database queries for skills.
"""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from tools.messaging.database import get_connection


def execute_read_query(sql: str, format: str = "table"):
    """
    Execute a read-only SQL query.

    Args:
        sql: SQL query (must be SELECT, SHOW, PRAGMA, or EXPLAIN)
        format: Output format (table, json, csv)

    Returns:
        Query results
    """
    # Safety check
    sql_upper = sql.strip().upper()
    allowed_prefixes = ["SELECT", "SHOW", "PRAGMA", "EXPLAIN"]
    blocked_keywords = ["DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "CREATE"]

    if not any(sql_upper.startswith(p) for p in allowed_prefixes):
        return {"error": "Only read-only queries allowed (SELECT, SHOW, PRAGMA)"}

    if any(k in sql_upper for k in blocked_keywords):
        return {"error": "Query contains blocked keywords"}

    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(sql)

        # Get column names
        columns = [desc[0] for desc in cursor.description] if cursor.description else []

        # Fetch results
        rows = cursor.fetchall()
        conn.close()

        # Format output
        if format == "json":
            results = [dict(row) for row in rows]
            return {"columns": columns, "rows": results, "count": len(rows)}

        elif format == "csv":
            lines = [",".join(columns)]
            for row in rows:
                lines.append(",".join(str(v) for v in row))
            return {"csv": "\n".join(lines), "count": len(rows)}

        else:  # table
            results = []
            for row in rows:
                results.append(dict(zip(columns, row)))
            return {"columns": columns, "rows": results, "count": len(rows)}

    except Exception as e:
        return {"error": str(e)}
