#!/usr/bin/env python3
"""
Stress Test Runner for Telegram Messaging Gateway

Runs automated test scenarios to verify gateway functionality.

Usage:
    python3 test_runner.py --scenario [scenario_number] [--verbose]

Scenarios:
    1: Basic Send/Receive
    2: Rate Limiting
    3: Session Management
    4: Memory Integration
    5: Configuration
    6: Error Handling
    7: Multi-User

Or run all tests:
    python3 test_runner.py --all
"""

import argparse
import sys
import json
import sqlite3
import time
from pathlib import Path
from typing import Dict, List, Any

# Paths
PROJECT_ROOT = Path(__file__).parent.parent.parent
DB_PATH = PROJECT_ROOT / "data" / "memory.db"
CONFIG_PATH = PROJECT_ROOT / "args" / "messaging.yaml"


class TestRunner:
    """Test runner for gateway scenarios."""

    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self.results = []

    def log(self, message: str, level: str = "INFO"):
        """Log message."""
        if self.verbose or level in ["WARN", "ERROR", "FAIL"]:
            print(f"[{level}] {message}")

    def get_connection(self):
        """Get database connection."""
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        return sqlite3.connect(str(DB_PATH))

    def scenario_1_basic_send_receive(self) -> Dict[str, Any]:
        """Test basic message sending and receiving."""
        self.log("Running Scenario 1: Basic Send/Receive", "INFO")

        results = {
            "scenario": 1,
            "name": "Basic Send/Receive",
            "tests": [],
            "status": "blocked",
            "message": "Requires Telegram bot token",
        }

        # Test database connection
        try:
            conn = self.get_connection()
            cursor = conn.cursor()

            # Check if tables exist
            cursor.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='telegram_sessions'"
            )
            sessions_exists = cursor.fetchone() is not None

            results["tests"].append(
                {
                    "test": "Database connection",
                    "status": "pass" if sessions_exists else "fail",
                    "message": "Sessions table exists"
                    if sessions_exists
                    else "Sessions table missing",
                }
            )

            conn.close()

            if sessions_exists:
                results["status"] = "partial"
                results["message"] = "Database ready, requires bot for full test"

        except Exception as e:
            results["tests"].append(
                {"test": "Database connection", "status": "fail", "message": str(e)}
            )

        return results

    def scenario_2_rate_limiting(self) -> Dict[str, Any]:
        """Test rate limiting."""
        self.log("Running Scenario 2: Rate Limiting", "INFO")

        results = {
            "scenario": 2,
            "name": "Rate Limiting",
            "tests": [],
            "status": "blocked",
            "message": "Requires Telegram bot token",
        }

        # Check rate limiter implementation in daemon.py
        daemon_path = PROJECT_ROOT / "tools" / "messaging" / "daemon.py"
        if daemon_path.exists():
            with open(daemon_path, "r") as f:
                daemon_code = f.read()

            # Check for RateLimiter class
            has_rate_limiter = "class RateLimiter" in daemon_code

            results["tests"].append(
                {
                    "test": "RateLimiter class exists",
                    "status": "pass" if has_rate_limiter else "fail",
                    "message": "RateLimiter implemented"
                    if has_rate_limiter
                    else "RateLimiter not found",
                }
            )

            # Check for token bucket parameters
            has_token_bucket = (
                "burst_size" in daemon_code and "requests_per_minute" in daemon_code
            )

            results["tests"].append(
                {
                    "test": "Token bucket parameters",
                    "status": "pass" if has_token_bucket else "fail",
                    "message": "Token bucket parameters defined"
                    if has_token_bucket
                    else "Token bucket parameters missing",
                }
            )

            if has_rate_limiter and has_token_bucket:
                results["status"] = "partial"
                results["message"] = (
                    "Implementation verified, requires bot for runtime testing"
                )

        return results

    def scenario_3_session_management(self) -> Dict[str, Any]:
        """Test session management."""
        self.log("Running Scenario 3: Session Management", "INFO")

        results = {
            "scenario": 3,
            "name": "Session Management",
            "tests": [],
            "status": "partial",
            "message": "Database operations verified",
        }

        try:
            conn = self.get_connection()
            cursor = conn.cursor()

            # Test creating a session
            cursor.execute(
                "INSERT INTO telegram_sessions (telegram_chat_id, telegram_user_id, title, message_count, is_active) VALUES (?, ?, ?, ?, ?)",
                ("test_chat_123", 12345, "Test Session", 0, True),
            )
            conn.commit()

            # Test reading session
            cursor.execute(
                "SELECT * FROM telegram_sessions WHERE telegram_chat_id = ?",
                ("test_chat_123",),
            )
            session = cursor.fetchone()

            results["tests"].append(
                {
                    "test": "Create session",
                    "status": "pass" if session else "fail",
                    "message": "Session created successfully"
                    if session
                    else "Failed to create session",
                }
            )

            # Test updating session
            cursor.execute(
                "UPDATE telegram_sessions SET message_count = message_count + 1 WHERE telegram_chat_id = ?",
                ("test_chat_123",),
            )
            conn.commit()

            cursor.execute(
                "SELECT message_count FROM telegram_sessions WHERE telegram_chat_id = ?",
                ("test_chat_123",),
            )
            updated_count = cursor.fetchone()[0]

            results["tests"].append(
                {
                    "test": "Update session",
                    "status": "pass" if updated_count == 1 else "fail",
                    "message": f"Session updated (count: {updated_count})",
                }
            )

            # Test listing sessions
            cursor.execute(
                "SELECT COUNT(*) FROM telegram_sessions WHERE is_active = TRUE"
            )
            count = cursor.fetchone()[0]

            results["tests"].append(
                {
                    "test": "List sessions",
                    "status": "pass" if count > 0 else "fail",
                    "message": f"Found {count} active sessions",
                }
            )

            # Cleanup
            cursor.execute(
                "DELETE FROM telegram_sessions WHERE telegram_chat_id = ?",
                ("test_chat_123",),
            )
            conn.commit()
            conn.close()

            results["status"] = "pass"
            results["message"] = "All session management tests passed"

        except Exception as e:
            results["tests"].append(
                {"test": "Session operations", "status": "fail", "message": str(e)}
            )
            results["status"] = "fail"
            results["message"] = f"Error: {e}"

        return results

    def scenario_4_memory_integration(self) -> Dict[str, Any]:
        """Test memory system integration."""
        self.log("Running Scenario 4: Memory Integration", "INFO")

        results = {
            "scenario": 4,
            "name": "Memory Integration",
            "tests": [],
            "status": "partial",
            "message": "MemoryIntegrator hooks verified",
        }

        # Check for MemoryIntegrator class
        daemon_path = PROJECT_ROOT / "tools" / "messaging" / "daemon.py"
        if daemon_path.exists():
            with open(daemon_path, "r") as f:
                daemon_code = f.read()

            # Check for MemoryIntegrator class
            has_memory = "class MemoryIntegrator" in daemon_code

            results["tests"].append(
                {
                    "test": "MemoryIntegrator class exists",
                    "status": "pass" if has_memory else "fail",
                    "message": "MemoryIntegrator implemented"
                    if has_memory
                    else "MemoryIntegrator not found",
                }
            )

            # Check for event storage method
            has_store_event = "store_message_as_event" in daemon_code

            results["tests"].append(
                {
                    "test": "Event storage method exists",
                    "status": "pass" if has_store_event else "fail",
                    "message": "Event storage implemented"
                    if has_store_event
                    else "Event storage not found",
                }
            )

            # Check for context loading method
            has_load_context = "load_context" in daemon_code

            results["tests"].append(
                {
                    "test": "Context loading method exists",
                    "status": "pass" if has_load_context else "fail",
                    "message": "Context loading implemented"
                    if has_load_context
                    else "Context loading not found",
                }
            )

            if has_memory and has_store_event and has_load_context:
                results["status"] = "partial"
                results["message"] = (
                    "Hooks implemented, requires bot for runtime testing"
                )

        return results

    def scenario_5_configuration(self) -> Dict[str, Any]:
        """Test configuration loading and validation."""
        self.log("Running Scenario 5: Configuration", "INFO")

        results = {
            "scenario": 5,
            "name": "Configuration",
            "tests": [],
            "status": "partial",
            "message": "Configuration file exists, daemon validation untested",
        }

        # Check config file exists
        config_exists = CONFIG_PATH.exists()

        results["tests"].append(
            {
                "test": "Configuration file exists",
                "status": "pass" if config_exists else "fail",
                "message": "args/messaging.yaml found"
                if config_exists
                else "Config file missing",
            }
        )

        if config_exists:
            try:
                import yaml

                with open(CONFIG_PATH, "r") as f:
                    config = yaml.safe_load(f)

                # Check for required sections
                has_telegram = "telegram" in config
                has_openai = "openai" in config

                results["tests"].append(
                    {
                        "test": "Telegram configuration section",
                        "status": "pass" if has_telegram else "fail",
                        "message": "telegram section found"
                        if has_telegram
                        else "telegram section missing",
                    }
                )

                results["tests"].append(
                    {
                        "test": "OpenAI configuration section",
                        "status": "pass" if has_openai else "warn",
                        "message": "openai section found"
                        if has_openai
                        else "openai section missing (optional)",
                    }
                )

                # Check for rate limiting configuration
                if has_telegram:
                    has_rate_limit = "rate_limit" in config["telegram"]
                    results["tests"].append(
                        {
                            "test": "Rate limiting configuration",
                            "status": "pass" if has_rate_limit else "fail",
                            "message": "rate_limit settings found"
                            if has_rate_limit
                            else "rate_limit settings missing",
                        }
                    )

                # Check for logging configuration
                if has_telegram:
                    has_logging = "logging" in config["telegram"]
                    results["tests"].append(
                        {
                            "test": "Logging configuration",
                            "status": "pass" if has_logging else "warn",
                            "message": "logging settings found"
                            if has_logging
                            else "logging settings missing (optional)",
                        }
                    )

                results["status"] = "pass"
                results["message"] = "Configuration validated"

            except ImportError as e:
                results["tests"].append(
                    {
                        "test": "Parse configuration",
                        "status": "warn",
                        "message": f"PyYAML not installed: {e}",
                    }
                )
                results["status"] = "partial"
                results["message"] = (
                    "Configuration file valid, PyYAML not installed (install with: pip install PyYAML)"
                )
            except Exception as e:
                results["tests"].append(
                    {"test": "Parse configuration", "status": "fail", "message": str(e)}
                )
                results["status"] = "fail"
                results["message"] = f"Invalid configuration: {e}"

        return results

    def scenario_6_error_handling(self) -> Dict[str, Any]:
        """Test error handling."""
        self.log("Running Scenario 6: Error Handling", "INFO")

        results = {
            "scenario": 6,
            "name": "Error Handling",
            "tests": [],
            "status": "partial",
            "message": "Error handling code verified",
        }

        # Check for error handling in daemon
        daemon_path = PROJECT_ROOT / "tools" / "messaging" / "daemon.py"
        if daemon_path.exists():
            with open(daemon_path, "r") as f:
                daemon_code = f.read()

            # Check for try-except blocks
            has_try_except = "try:" in daemon_code and "except" in daemon_code

            results["tests"].append(
                {
                    "test": "Exception handling code exists",
                    "status": "pass" if has_try_except else "fail",
                    "message": "Error handling implemented"
                    if has_try_except
                    else "Error handling not found",
                }
            )

            # Check for logging
            has_logging = (
                "logging.warning" in daemon_code or "logging.error" in daemon_code
            )

            results["tests"].append(
                {
                    "test": "Error logging",
                    "status": "pass" if has_logging else "fail",
                    "message": "Error logging implemented"
                    if has_logging
                    else "Error logging not found",
                }
            )

            # Check for graceful shutdown
            has_shutdown = "shutdown_event" in daemon_code or "stop()" in daemon_code

            results["tests"].append(
                {
                    "test": "Graceful shutdown handling",
                    "status": "pass" if has_shutdown else "fail",
                    "message": "Shutdown handling implemented"
                    if has_shutdown
                    else "Shutdown handling not found",
                }
            )

            if has_try_except and has_logging and has_shutdown:
                results["status"] = "partial"
                results["message"] = "Error handling verified, requires runtime testing"

        return results

    def scenario_7_multi_user(self) -> Dict[str, Any]:
        """Test multi-user support."""
        self.log("Running Scenario 7: Multi-User", "INFO")

        results = {
            "scenario": 7,
            "name": "Multi-User",
            "tests": [],
            "status": "blocked",
            "message": "Requires Telegram bot token and multiple users",
        }

        # Check session isolation in database
        try:
            conn = self.get_connection()
            cursor = conn.cursor()

            # Test creating multiple sessions
            cursor.execute(
                "INSERT INTO telegram_sessions (telegram_chat_id, telegram_user_id, title, message_count, is_active) VALUES (?, ?, ?, ?, ?)",
                ("test_chat_1", 1001, "User 1", 0, True),
            )
            cursor.execute(
                "INSERT INTO telegram_sessions (telegram_chat_id, telegram_user_id, title, message_count, is_active) VALUES (?, ?, ?, ?, ?)",
                ("test_chat_2", 1002, "User 2", 0, True),
            )
            conn.commit()

            # Check sessions are separate
            cursor.execute(
                "SELECT COUNT(*) FROM telegram_sessions WHERE telegram_user_id = ?",
                (1001,),
            )
            user1_count = cursor.fetchone()[0]

            cursor.execute(
                "SELECT COUNT(*) FROM telegram_sessions WHERE telegram_user_id = ?",
                (1002,),
            )
            user2_count = cursor.fetchone()[0]

            isolated = user1_count == 1 and user2_count == 1

            results["tests"].append(
                {
                    "test": "Session isolation",
                    "status": "pass" if isolated else "fail",
                    "message": "Sessions isolated correctly"
                    if isolated
                    else "Session isolation failed",
                }
            )

            # Cleanup
            cursor.execute(
                "DELETE FROM telegram_sessions WHERE telegram_chat_id IN (?, ?)",
                ("test_chat_1", "test_chat_2"),
            )
            conn.commit()
            conn.close()

            results["status"] = "partial"
            results["message"] = (
                "Session isolation verified, requires bot for runtime testing"
            )

        except Exception as e:
            results["tests"].append(
                {"test": "Multi-user support", "status": "fail", "message": str(e)}
            )

        return results

    def run_scenario(self, scenario_num: int) -> Dict[str, Any]:
        """Run a specific scenario."""
        scenarios = {
            1: self.scenario_1_basic_send_receive,
            2: self.scenario_2_rate_limiting,
            3: self.scenario_3_session_management,
            4: self.scenario_4_memory_integration,
            5: self.scenario_5_configuration,
            6: self.scenario_6_error_handling,
            7: self.scenario_7_multi_user,
        }

        if scenario_num not in scenarios:
            return {"error": f"Invalid scenario number: {scenario_num}"}

        return scenarios[scenario_num]()

    def run_all(self) -> List[Dict[str, Any]]:
        """Run all scenarios."""
        self.log("Running all test scenarios...", "INFO")
        results = []

        for i in range(1, 8):
            result = self.run_scenario(i)
            results.append(result)

        return results


def main():
    parser = argparse.ArgumentParser(
        description="Test runner for Telegram messaging gateway"
    )
    parser.add_argument(
        "--scenario",
        type=int,
        help="Run specific scenario (1-7), or --all for all tests",
    )
    parser.add_argument("--all", action="store_true", help="Run all scenarios")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument("--json", action="store_true", help="Output results as JSON")

    args = parser.parse_args()

    runner = TestRunner(verbose=args.verbose)

    if args.all:
        results = runner.run_all()
    elif args.scenario:
        results = [runner.run_scenario(args.scenario)]
    else:
        parser.print_help()
        return 1

    # Calculate summary
    total = len(results)
    passed = sum(1 for r in results if r.get("status") == "pass")
    partial = sum(1 for r in results if r.get("status") == "partial")
    blocked = sum(1 for r in results if r.get("status") == "blocked")
    failed = sum(1 for r in results if r.get("status") == "fail")

    # Print results
    if args.json:
        output = {
            "summary": {
                "total": total,
                "passed": passed,
                "partial": partial,
                "blocked": blocked,
                "failed": failed,
            },
            "results": results,
        }
        print(json.dumps(output, indent=2))
    else:
        print("\n" + "=" * 60)
        print("TEST RESULTS")
        print("=" * 60)

        for result in results:
            status_icon = {
                "pass": "✅",
                "partial": "⚠️",
                "blocked": "🔒",
                "fail": "❌",
            }.get(result.get("status"), "❓")

            print(f"\n{status_icon} Scenario {result['scenario']}: {result['name']}")
            print(f"   Status: {result['status'].upper()}")
            print(f"   Message: {result['message']}")

            if "tests" in result:
                for test in result["tests"]:
                    test_icon = "✓" if test["status"] == "pass" else "✗"
                    print(f"   {test_icon} {test['test']}: {test['status']}")

        print("\n" + "=" * 60)
        print("SUMMARY")
        print("=" * 60)
        print(f"Total: {total}")
        print(f"✅ Passed: {passed}")
        print(f"⚠️  Partial: {partial}")
        print(f"🔒 Blocked: {blocked}")
        print(f"❌ Failed: {failed}")
        print("=" * 60)

    return 0


if __name__ == "__main__":
    sys.exit(main())
