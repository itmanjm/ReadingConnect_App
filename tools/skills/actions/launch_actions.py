#!/usr/bin/env python3
"""
Launch Actions for Skills

Finds and launches previously built projects.
"""

import sys
import subprocess
from pathlib import Path
from typing import Optional, Dict, List, Any

PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from tools.messaging.database import get_connection


def find_and_launch_build(
    build_name: str,
    from_context: bool = False,
    user_id: int = None,
    chat_id: str = None,
) -> Dict[str, Any]:
    """
    Find a build by name and return launch information.

    Args:
        build_name: Name or partial name of the build
        from_context: Whether this was inferred from context
        user_id: Telegram user ID
        chat_id: Telegram chat ID

    Returns:
        Dict with success status, path, and launch command
    """
    try:
        # Normalize build name
        build_name_lower = build_name.lower().strip()

        # Search strategies in order of preference
        found_build = None

        # 1. Check if it's a direct folder name in apps/
        apps_dir = PROJECT_ROOT / "apps"
        if apps_dir.exists():
            # Exact match
            exact_path = apps_dir / build_name_lower.replace(" ", "-")
            if exact_path.exists():
                found_build = {
                    "name": build_name_lower,
                    "path": str(exact_path),
                    "type": "folder",
                }

            # Partial match
            if not found_build:
                for folder in apps_dir.iterdir():
                    if folder.is_dir():
                        folder_name = folder.name.lower()
                        if (
                            build_name_lower in folder_name
                            or folder_name in build_name_lower
                        ):
                            found_build = {
                                "name": folder.name,
                                "path": str(folder),
                                "type": "folder",
                            }
                            break

        # 2. Check recent build sessions from database
        if not found_build:
            conn = get_connection()
            cursor = conn.cursor()

            cursor.execute(
                """
                SELECT session_id, goal_name, project_path, created_at
                FROM build_sessions
                WHERE user_id = ? AND status = 'completed'
                AND (goal_name LIKE ? OR project_path LIKE ?)
                ORDER BY created_at DESC
                LIMIT 5
                """,
                (user_id, f"%{build_name_lower}%", f"%{build_name_lower}%"),
            )

            row = cursor.fetchone()
            conn.close()

            if row:
                found_build = {
                    "name": row["goal_name"],
                    "path": row["project_path"]
                    or str(PROJECT_ROOT / "apps" / row["goal_name"]),
                    "type": "build_session",
                    "session_id": row["session_id"],
                    "created_at": row["created_at"],
                }

        # 3. If from context and no match, get most recent build
        if not found_build and from_context:
            conn = get_connection()
            cursor = conn.cursor()

            cursor.execute(
                """
                SELECT session_id, goal_name, project_path, created_at
                FROM build_sessions
                WHERE user_id = ? AND status = 'completed'
                ORDER BY created_at DESC
                LIMIT 1
                """,
                (user_id,),
            )

            row = cursor.fetchone()
            conn.close()

            if row:
                found_build = {
                    "name": row["goal_name"],
                    "path": row["project_path"]
                    or str(PROJECT_ROOT / "apps" / row["goal_name"]),
                    "type": "build_session",
                    "session_id": row["session_id"],
                    "created_at": row["created_at"],
                }

        if not found_build:
            # Get suggestions
            suggestions = get_recent_builds(user_id, limit=5)

            return {
                "success": False,
                "error": f"Build '{build_name}' not found",
                "suggestions": suggestions,
            }

        # Generate launch command
        launch_cmd = generate_launch_command(found_build["path"])
        quick_access = generate_quick_access(found_build["path"])

        return {
            "success": True,
            "build_name": found_build["name"],
            "project_path": found_build["path"],
            "launch_command": launch_cmd,
            "quick_access": quick_access,
            "created_at": found_build.get("created_at", "Unknown"),
            "recent_build": "created_at" in found_build,
            "created_at": found_build.get("created_at", "Unknown"),
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


def generate_launch_command(project_path: str) -> str:
    """Generate appropriate launch command based on project type."""
    path = Path(project_path)

    if not path.exists():
        return f"cd {project_path}  # Directory not found"

    # Check for index.html (web dashboard)
    if (path / "index.html").exists():
        return f"open {path}/index.html"

    # Check for main.py
    if (path / "main.py").exists():
        return f"python {path}/main.py"

    # Check for app.py
    if (path / "app.py").exists():
        return f"python {path}/app.py"

    # Check for monitor.py
    if (path / "monitor.py").exists():
        return f"python {path}/monitor.py"

    # Check for README
    if (path / "README.md").exists():
        return f"cat {path}/README.md  # See README for launch instructions"

    # Default: just open the directory
    return f"open {path}"


def generate_quick_access(project_path: str) -> str:
    """Generate quick access instructions."""
    path = Path(project_path)

    if not path.exists():
        return "Directory not found"

    instructions = []

    if (path / "index.html").exists():
        instructions.append(f"• Web: http://localhost:8000 (if served)")
        instructions.append(f"• File: {path}/index.html")

    if (path / "README.md").exists():
        instructions.append(f"• Docs: See README.md for details")

    if list(path.glob("*.py")):
        instructions.append(f"• Python: Run scripts in this directory")

    return "\n".join(instructions) if instructions else f"• Browse: {path}"


def get_recent_builds(user_id: int, limit: int = 5) -> List[str]:
    """Get list of recent build names for suggestions."""
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT goal_name, project_path
            FROM build_sessions
            WHERE user_id = ? AND status = 'completed'
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (user_id, limit),
        )

        rows = cursor.fetchall()
        conn.close()

        suggestions = []
        for row in rows:
            name = row["goal_name"]
            path = row["project_path"]
            if path:
                folder = Path(path).name
                suggestions.append(f"{name} ({folder})")
            else:
                suggestions.append(name)

        # Also check apps directory
        apps_dir = PROJECT_ROOT / "apps"
        if apps_dir.exists():
            for folder in sorted(apps_dir.iterdir()):
                if folder.is_dir():
                    folder_name = folder.name
                    if folder_name not in [s.split()[0] for s in suggestions]:
                        suggestions.append(f"{folder_name} (apps/{folder_name})")

        return suggestions[:limit]

    except Exception:
        return []


def get_build_info(build_path: str) -> Dict[str, Any]:
    """Get detailed info about a build."""
    path = Path(build_path)

    if not path.exists():
        return {"exists": False}

    info = {"exists": True, "path": str(path), "name": path.name, "files": []}

    # List key files
    for file in path.iterdir():
        if file.is_file():
            info["files"].append(file.name)

    # Check for specific file types
    info["has_html"] = (path / "index.html").exists()
    info["has_python"] = len(list(path.glob("*.py"))) > 0
    info["has_readme"] = (path / "README.md").exists()

    return info
