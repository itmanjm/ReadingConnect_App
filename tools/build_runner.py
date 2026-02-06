#!/usr/bin/env python3
"""
Build Runner Script

Executes goal workflows using OpenCode or Claude Code CLI.
Streams output to database for real-time progress tracking.
"""

import sys
import subprocess
import time
import os
from pathlib import Path
from datetime import datetime

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from tools.messaging.daemon import (
    update_build_progress,
    add_build_output,
    complete_build_session,
    update_build_path,
    get_build_session,
)


def create_readme(goal_name: str, project_path: Path, builder: str):
    """Create README.md with launch instructions."""
    readme_content = f"""# {goal_name}

Built via Telegram Bot using {builder.upper()}

## Project Location

```
{project_path}
```

## How to Launch

### Option 1: Open in Browser (HTML files)

```bash
open {project_path}/index.html
```

### Option 2: Start Local Server

```bash
cd {project_path}
python3 -m http.server 8000
# Then open http://localhost:8000
```

### Option 3: Using npx (if package.json exists)

```bash
cd {project_path}
npm install
npm start
```

## Files

"""
    # List files in project
    if project_path.exists():
        for f in sorted(project_path.rglob("*")):
            if f.is_file():
                readme_content += f"- {f.relative_to(project_path)}\n"

    readme_path = project_path / "README.md"
    with open(readme_path, "w") as f:
        f.write(readme_content)

    return str(project_path)


def run_with_opencode(goal_name: str, session_id: str, prompt: str):
    """Execute build using OpenCode CLI."""
    opencode_cmd = os.environ.get("OPENCODE_CMD", "/Users/zero/.opencode/bin/opencode")

    add_build_output(session_id, f"🚀 Building with OpenCode...", is_error=False)
    add_build_output(
        session_id, f"📦 Command: {opencode_cmd} run '{prompt}'", is_error=False
    )

    try:
        proc = subprocess.Popen(
            [opencode_cmd, "run", prompt],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            cwd=str(PROJECT_ROOT),
        )

        pid = proc.pid
        add_build_output(session_id, f"🔧 Process started (PID: {pid})", is_error=False)

        # Read output in real-time
        for line in iter(proc.stdout.readline, ""):
            if line:
                stripped = line.rstrip("\n")
                add_build_output(session_id, stripped, is_error=False)

                # Update progress based on output
                if "Step" in stripped or "progress" in stripped.lower():
                    update_build_progress(session_id, step="Building", progress=50)
                elif "complete" in stripped.lower() or "done" in stripped.lower():
                    update_build_progress(session_id, step="Building", progress=80)

        proc.stdout.close()
        proc.wait()

        if proc.returncode == 0:
            add_build_output(
                session_id, f"✅ OpenCode build completed successfully!", is_error=False
            )
            update_build_progress(session_id, step="Complete", progress=100)

            # Find project folder and create README
            project_path = PROJECT_ROOT / "apps" / goal_name
            if project_path.exists():
                create_readme(goal_name, project_path, "OpenCode")
                update_build_path(session_id, str(project_path))
                add_build_output(
                    session_id,
                    f"📄 README created: {project_path}/README.md",
                    is_error=False,
                )

            complete_build_session(session_id, "completed")
        else:
            add_build_output(
                session_id,
                f"❌ OpenCode build failed (exit code: {proc.returncode})",
                is_error=True,
            )
            complete_build_session(
                session_id, "failed", f"OpenCode exited with code {proc.returncode}"
            )

    except Exception as e:
        add_build_output(
            session_id, f"❌ Error running OpenCode: {str(e)}", is_error=True
        )
        complete_build_session(session_id, "failed", str(e))


def run_with_claude(goal_name: str, session_id: str, prompt: str):
    """Execute build using Claude Code CLI."""
    claude_cmd = os.environ.get("CLAUDE_CMD", "/Users/zero/.local/bin/claude")

    add_build_output(session_id, f"🚀 Building with Claude Code...", is_error=False)
    add_build_output(
        session_id, f"📦 Command: {claude_cmd} -p '{prompt}'", is_error=False
    )

    try:
        proc = subprocess.Popen(
            [claude_cmd, "-p", prompt],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            cwd=str(PROJECT_ROOT),
        )

        pid = proc.pid
        add_build_output(session_id, f"🔧 Process started (PID: {pid})", is_error=False)

        # Read output in real-time
        for line in iter(proc.stdout.readline, ""):
            if line:
                stripped = line.rstrip("\n")
                add_build_output(session_id, stripped, is_error=False)

                # Update progress
                if "Step" in stripped or "progress" in stripped.lower():
                    update_build_progress(
                        session_id, step="Claude Building", progress=50
                    )
                elif "complete" in stripped.lower() or "done" in stripped.lower():
                    update_build_progress(
                        session_id, step="Claude Complete", progress=80
                    )

        proc.stdout.close()
        proc.wait()

        if proc.returncode == 0:
            add_build_output(
                session_id,
                f"✅ Claude Code build completed successfully!",
                is_error=False,
            )
            update_build_progress(session_id, step="Complete", progress=100)

            # Find project folder and create README
            project_path = PROJECT_ROOT / "apps" / goal_name
            if project_path.exists():
                create_readme(goal_name, project_path, "Claude Code")
                update_build_path(session_id, str(project_path))
                add_build_output(
                    session_id,
                    f"📄 README created: {project_path}/README.md",
                    is_error=False,
                )

            complete_build_session(session_id, "completed")
        else:
            add_build_output(
                session_id,
                f"❌ Claude Code build failed (exit code: {proc.returncode})",
                is_error=True,
            )
            complete_build_session(
                session_id, "failed", f"Claude exited with code {proc.returncode}"
            )

    except Exception as e:
        add_build_output(
            session_id, f"❌ Error running Claude Code: {str(e)}", is_error=True
        )
        complete_build_session(session_id, "failed", str(e))


def generate_build_prompt(goal_name: str, session_id: str) -> str:
    """Generate the build prompt based on goal name."""
    goal_file = PROJECT_ROOT / "goals" / f"{goal_name}.md"

    prompts = {
        "build_app": f"""
Build a simple dashboard that says "HELLO WORLD".

Requirements:
1. Create a simple HTML page with a dashboard that displays "HELLO WORLD"
2. Use clean, modern styling
3. Save the file as: apps/dashboard/index.html
4. Make it self-contained (no external CDN dependencies if possible)

Return the full code that should be written to the file.
""",
        "youtube_monitoring": f"""
Build a YouTube monitoring dashboard.

Requirements:
1. Create a monitoring interface for tracking YouTube channels
2. Include placeholders for 23 channels
3. Display metrics like subscriber count, recent videos, views
4. Save as: apps/youtube-monitor/index.html

Return the full code.
""",
        "content_automation": f"""
Build a content automation dashboard.

Requirements:
1. Create a dashboard for AI content creation workflow
2. Include sections for OpenClaw, Cursor, and local models
3. Display workflow status and progress
4. Save as: apps/content-automation/index.html

Return the full code.
""",
    }

    default_prompt = f"""
Build an application for goal: {goal_name}

Requirements:
1. Create the necessary files based on the goal requirements
2. Follow best practices
3. Save files in an appropriate location under: apps/{goal_name}/
4. Make it functional and ready to use

Return the code that should be written.
"""

    return prompts.get(goal_name, default_prompt)


def run_goal_workflow(goal_name: str, session_id: str, builder: str = "opencode"):
    """Execute goal workflow with specified builder."""
    goal_file = PROJECT_ROOT / "goals" / f"{goal_name}.md"

    if not goal_file.exists():
        add_build_output(
            session_id, f"⚠️ Goal file not found: {goal_file}", is_error=True
        )
        add_build_output(session_id, f"📝 Available goals:", is_error=False)

        # List available goals
        goals_dir = PROJECT_ROOT / "goals"
        if goals_dir.exists():
            for gf in goals_dir.glob("*.md"):
                if gf.name != "manifest.md":
                    add_build_output(session_id, f"  - {gf.stem}", is_error=False)

        complete_build_session(
            session_id, "failed", f"Goal file not found: {goal_file}"
        )
        return

    add_build_output(session_id, f"🚀 Starting build: {goal_name}", is_error=False)
    add_build_output(session_id, f"📄 Goal file: {goal_file.name}", is_error=False)
    add_build_output(session_id, f"🔨 Builder: {builder.upper()}", is_error=False)

    # ATLAS workflow simulation
    atlas_steps = [
        ("A", "Architect", 10),
        ("T", "Trace", 30),
        ("L", "Link", 50),
    ]

    for step_letter, step_name, progress in atlas_steps:
        add_build_output(session_id, f"\n{'=' * 50}", is_error=False)
        add_build_output(
            session_id, f"📋 Step {step_letter}: {step_name}", is_error=False
        )
        update_build_progress(session_id, step=step_name, progress=progress)

        # Simulate analysis
        time.sleep(0.3)
        add_build_output(session_id, f"  → Analyzing requirements...", is_error=False)
        time.sleep(0.3)
        add_build_output(session_id, f"  → Designing solution...", is_error=False)
        time.sleep(0.3)
        add_build_output(
            session_id, f"  → ✓ Step {step_letter} complete", is_error=False
        )

    # Generate and execute build prompt
    add_build_output(session_id, f"\n{'=' * 50}", is_error=False)
    add_build_output(
        session_id, f"🔨 Step A: Assemble (Code Generation)", is_error=False
    )
    update_build_progress(session_id, step="Assemble", progress=70)

    prompt = generate_build_prompt(goal_name, session_id)

    if builder == "claude":
        run_with_claude(goal_name, session_id, prompt)
    else:
        run_with_opencode(goal_name, session_id, prompt)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python build_runner.py <goal_name> <session_id> [--claude]")
        print("  --claude: Use Claude Code CLI instead of OpenCode")
        sys.exit(1)

    goal_name = sys.argv[1]
    session_id = sys.argv[2]
    builder = "claude" if "--claude" in sys.argv else "opencode"

    run_goal_workflow(goal_name, session_id, builder)
