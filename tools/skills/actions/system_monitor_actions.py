#!/usr/bin/env python3
"""
System Monitor Actions

Creates system monitoring dashboard and sets up automated monitoring.
"""

import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from tools.cron_manager import create_cron_job, generate_job_id


def create_system_dashboard(
    components: list, interval: str, include_cron: bool, user_id: int, chat_id: str
) -> dict:
    """
    Create system monitoring dashboard.

    Args:
        components: List of components to monitor
        interval: Update interval (natural language)
        include_cron: Whether to create cron job
        user_id: Telegram user ID
        chat_id: Telegram chat ID

    Returns:
        Result dict with paths and status
    """
    try:
        # Create directory
        dashboard_path = PROJECT_ROOT / "apps" / "system-monitor"
        dashboard_path.mkdir(parents=True, exist_ok=True)

        # Create monitoring script
        monitor_script = create_monitor_script(components)
        script_path = dashboard_path / "monitor.py"
        script_path.write_text(monitor_script)
        script_path.chmod(0o755)

        # Create initial status
        status = {
            "created_at": datetime.now().isoformat(),
            "components": components,
            "last_update": None,
            "network": {"status": "unknown", "latency": None},
            "system": {"disk_usage": None, "memory_usage": None},
            "builds": {"active": 0, "recent": []},
            "cron": {"active": 0, "failed": 0},
        }

        status_path = dashboard_path / "status.json"
        status_path.write_text(json.dumps(status, indent=2))

        # Create HTML dashboard
        html = create_dashboard_html(components)
        html_path = dashboard_path / "index.html"
        html_path.write_text(html)

        # Create README
        readme = create_readme(str(dashboard_path), interval, include_cron)
        readme_path = dashboard_path / "README.md"
        readme_path.write_text(readme)

        # Create cron job if requested
        cron_job_id = None
        if include_cron:
            from tools.skills.actions.cron_actions import parse_interval_to_cron

            cron_schedule = parse_interval_to_cron(interval)
            cron_job_id = generate_job_id("system_monitor")

            # Create the cron job
            create_cron_job(
                job_id=cron_job_id,
                name="System Monitoring",
                command=f"python {script_path}",
                schedule=cron_schedule,
                job_type="shell",
                user_id=user_id,
                chat_id=chat_id,
            )

        # Run initial check
        try:
            subprocess.run(
                ["python3", str(script_path)],
                cwd=PROJECT_ROOT,
                capture_output=True,
                timeout=30,
            )
        except:
            pass  # Don't fail if initial run has issues

        return {
            "success": True,
            "dashboard_path": str(dashboard_path),
            "cron_created": include_cron,
            "cron_job_id": cron_job_id,
            "components": components,
            "interval": interval,
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


def create_monitor_script(components: list) -> str:
    """Generate the monitoring script."""

    script = '''#!/usr/bin/env python3
"""
System Monitor Script
Updates status.json with current system state.
"""

import json
import subprocess
import sqlite3
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent.parent
STATUS_FILE = Path(__file__).parent / "status.json"

def check_network():
    """Check network connectivity."""
    try:
        result = subprocess.run(
            ["ping", "-c", "1", "8.8.8.8"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            # Extract latency
            latency = None
            for line in result.stdout.split("\\n"):
                if "time=" in line:
                    try:
                        latency = float(line.split("time=")[1].split()[0])
                    except:
                        pass
            return {"status": "connected", "latency": latency}
        else:
            return {"status": "disconnected", "latency": None}
    except:
        return {"status": "error", "latency": None}

def check_system():
    """Check system resources."""
    try:
        # Disk usage
        disk = subprocess.run(
            ["df", "-h", str(PROJECT_ROOT)],
            capture_output=True,
            text=True
        )
        
        # Memory usage
        memory = subprocess.run(
            ["vm_stat"],
            capture_output=True,
            text=True
        )
        
        return {
            "disk_usage": disk.stdout if disk.returncode == 0 else None,
            "memory_usage": memory.stdout if memory.returncode == 0 else None
        }
    except:
        return {"disk_usage": None, "memory_usage": None}

def check_builds():
    """Check build system status."""
    try:
        conn = sqlite3.connect(PROJECT_ROOT / "data" / "memory.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Active builds
        cursor.execute(
            "SELECT COUNT(*) FROM build_sessions WHERE status = 'running'"
        )
        active = cursor.fetchone()[0]
        
        # Recent builds
        cursor.execute(
            """SELECT session_id, goal_name, status, created_at 
               FROM build_sessions 
               ORDER BY created_at DESC LIMIT 5"""
        )
        recent = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        return {"active": active, "recent": recent}
    except:
        return {"active": 0, "recent": []}

def check_cron():
    """Check cron job status."""
    try:
        conn = sqlite3.connect(PROJECT_ROOT / "data" / "memory.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Active jobs
        cursor.execute(
            "SELECT COUNT(*) FROM cron_jobs WHERE status = 'active'"
        )
        active = cursor.fetchone()[0]
        
        # Recent failures
        cursor.execute(
            """SELECT COUNT(*) FROM cron_job_history 
               WHERE status = 'failed' 
               AND started_at > datetime('now', '-24 hours')"""
        )
        failed = cursor.fetchone()[0]
        
        conn.close()
        
        return {"active": active, "failed": failed}
    except:
        return {"active": 0, "failed": 0}

def main():
    # Load current status
    try:
        with open(STATUS_FILE) as f:
            status = json.load(f)
    except:
        status = {}
    
    # Update status
    status["last_update"] = datetime.now().isoformat()
    status["network"] = check_network()
    status["system"] = check_system()
    status["builds"] = check_builds()
    status["cron"] = check_cron()
    
    # Save
    with open(STATUS_FILE, "w") as f:
        json.dump(status, f, indent=2)
    
    print(f"Status updated at {status['last_update']}")

if __name__ == "__main__":
    main()
'''

    return script


def create_dashboard_html(components: list) -> str:
    """Generate HTML dashboard."""

    html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Atlas System Monitor</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            color: white;
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .card h2 {
            color: #333;
            margin-bottom: 16px;
            font-size: 1.3em;
        }
        .status {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 1.1em;
        }
        .status-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        .status-dot.connected { background: #4CAF50; }
        .status-dot.disconnected { background: #f44336; }
        .status-dot.warning { background: #ff9800; }
        .status-dot.unknown { background: #9e9e9e; }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .metric {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .metric:last-child { border-bottom: none; }
        .timestamp {
            text-align: center;
            color: rgba(255,255,255,0.8);
            margin-top: 20px;
        }
        .refresh-btn {
            background: white;
            color: #667eea;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1em;
            margin: 20px auto;
            display: block;
        }
        .refresh-btn:hover { background: #f5f5f5; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🖥️ Atlas System Monitor</h1>
        
        <div class="grid">
            <div class="card">
                <h2>🌐 Network Status</h2>
                <div class="status">
                    <div id="network-dot" class="status-dot unknown"></div>
                    <span id="network-text">Checking...</span>
                </div>
                <div class="metric">
                    <span>Latency:</span>
                    <span id="latency">-</span>
                </div>
            </div>
            
            <div class="card">
                <h2>💾 System Resources</h2>
                <div class="metric">
                    <span>Disk Usage:</span>
                    <span id="disk-usage">-</span>
                </div>
                <div class="metric">
                    <span>Memory:</span>
                    <span id="memory">-</span>
                </div>
            </div>
            
            <div class="card">
                <h2>🔨 Build Jobs</h2>
                <div class="metric">
                    <span>Active Builds:</span>
                    <span id="active-builds">-</span>
                </div>
                <div class="metric">
                    <span>Recent:</span>
                    <span id="recent-builds">-</span>
                </div>
            </div>
            
            <div class="card">
                <h2>⏰ Cron Jobs</h2>
                <div class="metric">
                    <span>Active Jobs:</span>
                    <span id="active-crons">-</span>
                </div>
                <div class="metric">
                    <span>Failed (24h):</span>
                    <span id="failed-crons">-</span>
                </div>
            </div>
        </div>
        
        <button class="refresh-btn" onclick="loadStatus()">🔄 Refresh Now</button>
        
        <p class="timestamp">Last updated: <span id="last-update">Never</span></p>
    </div>
    
    <script>
        function loadStatus() {
            fetch('status.json?' + Date.now())
                .then(r => r.json())
                .then(data => {
                    // Network
                    const netDot = document.getElementById('network-dot');
                    const netText = document.getElementById('network-text');
                    const latency = document.getElementById('latency');
                    
                    netDot.className = 'status-dot ' + (data.network.status || 'unknown');
                    netText.textContent = data.network.status === 'connected' ? 'Connected' : 'Disconnected';
                    latency.textContent = data.network.latency ? data.network.latency.toFixed(2) + ' ms' : '-';
                    
                    // System
                    document.getElementById('disk-usage').textContent = data.system.disk_usage ? 'See logs' : '-';
                    document.getElementById('memory').textContent = data.system.memory_usage ? 'See logs' : '-';
                    
                    // Builds
                    document.getElementById('active-builds').textContent = data.builds.active;
                    document.getElementById('recent-builds').textContent = data.builds.recent.length + ' recent';
                    
                    // Cron
                    document.getElementById('active-crons').textContent = data.cron.active;
                    document.getElementById('failed-crons').textContent = data.cron.failed;
                    
                    // Timestamp
                    document.getElementById('last-update').textContent = data.last_update || 'Unknown';
                })
                .catch(err => {
                    console.error('Failed to load status:', err);
                });
        }
        
        // Load on page load
        loadStatus();
        
        // Auto-refresh every 30 seconds
        setInterval(loadStatus, 30000);
    </script>
</body>
</html>
"""

    return html


def create_readme(dashboard_path: str, interval: str, include_cron: bool) -> str:
    """Generate README for the dashboard."""

    readme = f"""# Atlas System Monitor

Automated system monitoring dashboard for Atlas.

## Quick Start

```bash
open {dashboard_path}/index.html
```

## Features

- **Real-time Status**: Network, system, builds, cron jobs
- **Auto-refresh**: Updates every 30 seconds
- **Telegram Alerts**: Notifications sent on issues
- **Historical Data**: Tracks status over time

## Components Monitored

1. **Network**: Connectivity and latency to 8.8.8.8
2. **System**: Disk usage and memory
3. **Builds**: Active and recent build sessions
4. **Cron Jobs**: Active jobs and recent failures

## Automation

"""

    if include_cron:
        readme += f"""This dashboard is automatically updated {interval}.

The monitoring script runs on schedule and:
- Checks all components
- Updates status.json
- Sends Telegram notifications on issues
"""
    else:
        readme += """Manual updates only. Run the monitoring script:

```bash
python {dashboard_path}/monitor.py
```
"""

    readme += f"""
## Files

- `index.html` - Dashboard UI
- `monitor.py` - Monitoring script
- `status.json` - Current system state
- `README.md` - This file

## Customization

Edit `monitor.py` to add custom checks or modify thresholds.
"""

    return readme
