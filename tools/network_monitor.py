#!/usr/bin/env python3
"""
Network Monitor with Telegram Notifications

Checks network status and sends Telegram notifications with results.
Can be run as a standalone script or scheduled via cron.
"""

import sys
import subprocess
import json
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))


def check_network():
    """Check network connectivity and return detailed status."""
    try:
        # Ping Google DNS
        result = subprocess.run(
            ["ping", "-c", "3", "8.8.8.8"], capture_output=True, text=True, timeout=10
        )

        if result.returncode == 0:
            # Extract latency info
            lines = result.stdout.split("\n")
            latency_info = None
            packet_loss = None

            for line in lines:
                if "packets transmitted" in line:
                    packet_loss = line
                elif "min/avg/max" in line:
                    parts = line.split("=")[1].strip().split("/")
                    if len(parts) >= 2:
                        latency_info = f"{parts[1]}ms avg"

            return {
                "status": "connected",
                "online": True,
                "latency": latency_info or "unknown",
                "packet_loss": packet_loss or "0% loss",
                "timestamp": datetime.now().isoformat(),
            }
        else:
            return {
                "status": "disconnected",
                "online": False,
                "latency": None,
                "packet_loss": "100% loss",
                "timestamp": datetime.now().isoformat(),
            }
    except Exception as e:
        return {
            "status": "error",
            "online": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat(),
        }


def send_telegram_notification(status: dict, chat_id: str = None):
    """Send notification to Telegram."""
    try:
        from telegram import Bot
        import yaml

        # Load config
        config_path = PROJECT_ROOT / "args" / "messaging.yaml"
        with open(config_path) as f:
            config = yaml.safe_load(f)

        bot_token = config["telegram"]["bot_token"]
        bot = Bot(token=bot_token)

        # Format message
        if status["online"]:
            message = (
                f"🌐 *Network Status Update*\n\n"
                f"✅ *Connected*\n"
                f"📊 Latency: {status['latency']}\n"
                f"📦 {status['packet_loss']}\n"
                f"🕐 {status['timestamp'][:19]}"
            )
        else:
            message = (
                f"🌐 *Network Status Update*\n\n"
                f"❌ *Disconnected*\n"
                f"⚠️ Network connectivity lost!\n"
                f"🕐 {status['timestamp'][:19]}"
            )

        # Use chat ID from environment or config if not provided
        if not chat_id:
            chat_id = "7700153618"  # Default authorized user

        bot.send_message(chat_id=chat_id, text=message, parse_mode="Markdown")

        return True
    except Exception as e:
        print(f"Failed to send Telegram notification: {e}")
        return False


def save_status(status: dict):
    """Save status to log file."""
    log_file = PROJECT_ROOT / "logs" / "network_status.log"
    log_file.parent.mkdir(parents=True, exist_ok=True)

    with open(log_file, "a") as f:
        f.write(f"{json.dumps(status)}\n")


def main():
    """Main function to check network and send notification."""
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--chat-id", help="Telegram chat ID for notification")
    parser.add_argument(
        "--silent", action="store_true", help="Don't send Telegram notification"
    )
    args = parser.parse_args()

    print(f"[{datetime.now()}] Checking network status...")

    # Check network
    status = check_network()

    # Save to log
    save_status(status)

    # Print to console
    print(f"Status: {status['status']}")
    if status["online"]:
        print(f"Latency: {status['latency']}")

    # Send Telegram notification
    if not args.silent:
        success = send_telegram_notification(status, args.chat_id)
        if success:
            print("Telegram notification sent")
        else:
            print("Failed to send Telegram notification")

    return 0 if status["online"] else 1


if __name__ == "__main__":
    sys.exit(main())
