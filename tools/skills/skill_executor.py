#!/usr/bin/env python3
"""
Skill Executor

Executes skill actions safely with validation and logging.
"""

import json
import subprocess
import sqlite3
from typing import Dict, Any, Optional
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent.parent

from tools.skills.skill_parser import Skill, SkillParameter
from tools.messaging.database import get_connection


class SkillExecutionError(Exception):
    """Error during skill execution."""

    pass


class SkillValidator:
    """Validate skill parameters and safety."""

    @staticmethod
    def validate_parameters(params: Dict, skill: Skill) -> tuple:
        """
        Validate parameters against skill definition.
        Returns (is_valid, error_message, sanitized_params).
        """
        sanitized = {}

        for param in skill.parameters:
            value = params.get(param.name)

            # Check required
            if param.required and value is None:
                if param.default is not None:
                    value = param.default
                else:
                    return False, f"Missing required parameter: {param.name}", {}

            if value is None:
                continue

            # Type validation
            try:
                if param.type == "integer":
                    value = int(value)
                elif param.type == "string":
                    value = str(value)
                elif param.type == "boolean":
                    if isinstance(value, str):
                        value = value.lower() in ("true", "yes", "1", "on")
                    else:
                        value = bool(value)
                elif param.type == "array":
                    if isinstance(value, str):
                        value = [v.strip() for v in value.split(",")]
            except (ValueError, TypeError) as e:
                return False, f"Invalid type for {param.name}: {e}", {}

            # Enum validation
            if param.enum and value not in param.enum:
                return False, f"{param.name} must be one of: {param.enum}", {}

            # Custom validation
            if param.validation:
                if "min_length" in param.validation:
                    if len(str(value)) < param.validation["min_length"]:
                        return False, f"{param.name} too short", {}

                if "max_length" in param.validation:
                    if len(str(value)) > param.validation["max_length"]:
                        return False, f"{param.name} too long", {}

                if "min" in param.validation and isinstance(value, (int, float)):
                    if value < param.validation["min"]:
                        return False, f"{param.name} below minimum", {}

                if "max" in param.validation and isinstance(value, (int, float)):
                    if value > param.validation["max"]:
                        return False, f"{param.name} above maximum", {}

                if "allowed_prefixes" in param.validation:
                    str_val = str(value).upper()
                    allowed = [p.upper() for p in param.validation["allowed_prefixes"]]
                    if not any(str_val.startswith(p) for p in allowed):
                        return False, f"{param.name} must start with: {allowed}", {}

                if "blocked_keywords" in param.validation:
                    str_val = str(value).upper()
                    blocked = [k.upper() for k in param.validation["blocked_keywords"]]
                    if any(k in str_val for k in blocked):
                        return False, f"{param.name} contains blocked keywords", {}

            sanitized[param.name] = value

        return True, None, sanitized


class SkillExecutor:
    """Execute skill actions."""

    def __init__(self):
        self.validator = SkillValidator()

    def execute(self, skill: Skill, parameters: Dict) -> Dict[str, Any]:
        """
        Execute a skill with given parameters.
        Returns execution result.
        """
        # Validate parameters
        is_valid, error_msg, sanitized_params = self.validator.validate_parameters(
            parameters, skill
        )

        if not is_valid:
            return {
                "success": False,
                "error": error_msg,
                "skill_id": skill.skill_id,
                "action": "validation",
            }

        # Log execution start
        execution_id = self._log_execution_start(skill, sanitized_params)

        try:
            # Execute actions
            results = []
            for action in skill.actions:
                result = self._execute_action(action, sanitized_params, skill)
                results.append(result)

            # Format response
            response = self._format_response(skill, sanitized_params, results)

            # Log success
            self._log_execution_complete(execution_id, True, response)

            return {
                "success": True,
                "skill_id": skill.skill_id,
                "response": response,
                "results": results,
            }

        except Exception as e:
            error_msg = str(e)
            self._log_execution_complete(execution_id, False, None, error_msg)

            # Apply error handling from skill
            if skill.error_handling:
                return self._handle_error(skill, error_msg)

            return {
                "success": False,
                "error": error_msg,
                "skill_id": skill.skill_id,
                "action": "execution",
            }

    def _execute_action(self, action: Any, params: Dict, skill: Skill) -> Any:
        """Execute a single action."""
        action_type = action.action_type

        if action_type == "python_function":
            return self._execute_python_function(action, params)
        elif action_type == "shell_command":
            return self._execute_shell_command(action, params, skill)
        elif action_type == "conversation_workflow":
            return {"type": "workflow", "workflow": action.workflow}
        else:
            raise SkillExecutionError(f"Unknown action type: {action_type}")

    def _execute_python_function(self, action: Any, params: Dict) -> Any:
        """Execute a Python function action."""
        module_name = action.module
        function_name = action.function
        action_params = action.parameters or {}

        # Import module
        try:
            module = __import__(module_name, fromlist=[function_name])
            func = getattr(module, function_name)
        except (ImportError, AttributeError) as e:
            raise SkillExecutionError(
                f"Cannot import {module_name}.{function_name}: {e}"
            )

        # Prepare parameters
        call_params = {}
        for key, value in action_params.items():
            # Replace template variables
            if (
                isinstance(value, str)
                and value.startswith("{{")
                and value.endswith("}}")
            ):
                var_name = value[2:-2].strip()
                call_params[key] = params.get(var_name)
            else:
                call_params[key] = value

        # Call function
        return func(**call_params)

    def _execute_shell_command(self, action: Any, params: Dict, skill: Skill) -> Any:
        """Execute a shell command action."""
        if skill.safety_level == "danger":
            raise SkillExecutionError("Danger-level shell commands not allowed")

        command = action.command

        # Replace parameters
        for key, value in params.items():
            placeholder = f"{{{key}}}"
            command = command.replace(placeholder, str(value))

        # Execute with timeout
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=60,
                cwd=PROJECT_ROOT,
            )

            return {
                "returncode": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr,
            }
        except subprocess.TimeoutExpired:
            raise SkillExecutionError("Command timed out after 60 seconds")
        except Exception as e:
            raise SkillExecutionError(f"Command failed: {e}")

    def _format_response(self, skill: Skill, params: Dict, results: List) -> str:
        """Format response using template."""
        template = skill.response_template

        # Build context for template
        context = {
            "skill": skill,
            "params": params,
            "results": results[0] if results else None,
            "result": results[0] if results else None,
        }

        # Simple template rendering
        try:
            response = template

            # Replace result variables from action result
            if results and len(results) > 0:
                result = results[0]
                if isinstance(result, dict):
                    for key, value in result.items():
                        placeholder = f"{{{{{key}}}}}"
                        response = response.replace(
                            placeholder, str(value) if value is not None else ""
                        )

            # Replace parameter variables
            for key, value in params.items():
                placeholder = f"{{{{{key}}}}}"
                response = response.replace(
                    placeholder, str(value) if value is not None else ""
                )

            # Clean up any remaining template placeholders
            import re

            response = re.sub(r"\{\{\w+\}\}", "", response)

            return response.strip()

        except Exception as e:
            # Fallback to simple result display
            return f"Result: {results[0] if results else 'No result'}"

    def _render_template(self, template: str, context: Dict) -> str:
        """Basic template rendering."""
        # This is a simplified version - could use Jinja2
        # For now, just return template with basic variable substitution
        response = template

        # Replace parameter variables
        params = context.get("params", {})
        for key, value in params.items():
            placeholder = f"{{{{{key}}}}}"
            response = response.replace(placeholder, str(value))

        # Handle simple if results
        if "{% if results %}" in response:
            results = context.get("results")
            if results:
                # Extract content between if and endif
                pattern = r"{% if results %}(.*?){% endif %}"
                import re

                match = re.search(pattern, response, re.DOTALL)
                if match:
                    response = response.replace(
                        f"{{% if results %}}{match.group(1)}{{% endif %}}",
                        match.group(1),
                    )
            else:
                # Remove the if block
                pattern = r"{% if results %}(.*?){% endif %}"
                import re

                response = re.sub(pattern, "", response, flags=re.DOTALL)

        return response.strip()

    def _handle_error(self, skill: Skill, error_msg: str) -> Dict:
        """Handle execution error based on skill configuration."""
        error_config = skill.error_handling

        if not error_config:
            return {"success": False, "error": error_msg, "skill_id": skill.skill_id}

        on_error = error_config.get("on_execution_error", {})
        action = on_error.get("action", "show_error")
        message = on_error.get("message", error_msg)

        return {
            "success": False,
            "error": message,
            "skill_id": skill.skill_id,
            "action": action,
        }

    def _log_execution_start(self, skill: Skill, params: Dict) -> str:
        """Log execution start to database."""
        execution_id = f"exec_{datetime.now().strftime('%Y%m%d%H%M%S')}"

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO skill_executions (execution_id, skill_id, parameters, started_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            """,
            (execution_id, skill.skill_id, json.dumps(params)),
        )
        conn.commit()
        conn.close()

        return execution_id

    def _log_execution_complete(
        self, execution_id: str, success: bool, response: Any, error: str = None
    ):
        """Log execution completion."""
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE skill_executions
            SET success = ?, response = ?, error = ?, completed_at = CURRENT_TIMESTAMP
            WHERE execution_id = ?
            """,
            (success, json.dumps(response) if response else None, error, execution_id),
        )
        conn.commit()
        conn.close()


# Global executor instance
_executor = None


def get_executor() -> SkillExecutor:
    """Get or create global executor instance."""
    global _executor
    if _executor is None:
        _executor = SkillExecutor()
    return _executor


def execute_skill(skill: Skill, parameters: Dict) -> Dict[str, Any]:
    """Execute a skill with parameters."""
    return get_executor().execute(skill, parameters)
