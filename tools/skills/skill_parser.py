#!/usr/bin/env python3
"""
Skill Parser

Parses skill markdown files with YAML frontmatter.
Extracts triggers, parameters, actions, and metadata.
"""

import re
import yaml
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass

PROJECT_ROOT = Path(__file__).parent.parent.parent


@dataclass
class SkillParameter:
    """Skill parameter definition."""

    name: str
    type: str
    required: bool
    description: str
    default: Any = None
    validation: Dict = None
    enum: List[str] = None


@dataclass
class SkillTrigger:
    """Natural language trigger pattern."""

    pattern: str
    confidence: float
    context_required: bool = False
    requires_followup: bool = False


@dataclass
class SkillAction:
    """Skill action to execute."""

    id: str
    action_type: str  # python_function, shell_command, conversation_workflow
    module: str = None
    function: str = None
    parameters: Dict = None
    workflow: List = None


@dataclass
class Skill:
    """Complete skill definition."""

    skill_id: str
    name: str
    description: str
    category: str
    version: str
    author: str
    date_created: str

    triggers: List[SkillTrigger]
    parameters: List[SkillParameter]
    actions: List[SkillAction]

    safety_level: str
    require_confirmation: bool
    read_only: bool

    response_template: str
    error_handling: Dict
    examples: List[Dict]
    related_skills: List[str]

    raw_content: str


class SkillParser:
    """Parse skill markdown files."""

    def __init__(self, skills_dir: Path = None):
        self.skills_dir = skills_dir or (PROJECT_ROOT / "context" / "skills")

    def parse_skill(self, skill_id: str) -> Optional[Skill]:
        """Parse a skill file by ID."""
        skill_file = self.skills_dir / f"{skill_id}.md"
        if not skill_file.exists():
            return None

        content = skill_file.read_text()
        return self.parse_content(content)

    def parse_content(self, content: str) -> Skill:
        """Parse skill content."""
        # Extract YAML frontmatter
        pattern = r"^---\s*\n(.*?)\n---\s*\n(.*)$"
        match = re.match(pattern, content, re.DOTALL)

        if not match:
            raise ValueError("Invalid skill format: missing YAML frontmatter")

        yaml_content = match.group(1)
        markdown_content = match.group(2)

        # Parse YAML
        data = yaml.safe_load(yaml_content)

        # Parse triggers
        triggers = []
        for t in data.get("triggers", []):
            triggers.append(
                SkillTrigger(
                    pattern=t["pattern"],
                    confidence=t.get("confidence", 0.8),
                    context_required=t.get("context_required", False),
                    requires_followup=t.get("requires_followup", False),
                )
            )

        # Parse parameters
        parameters = []
        for p in data.get("parameters", []):
            parameters.append(
                SkillParameter(
                    name=p["name"],
                    type=p["type"],
                    required=p.get("required", False),
                    description=p.get("description", ""),
                    default=p.get("default"),
                    validation=p.get("validation"),
                    enum=p.get("enum"),
                )
            )

        # Parse actions
        actions = []
        for a in data.get("actions", []):
            actions.append(
                SkillAction(
                    id=a["id"],
                    action_type=a["type"],
                    module=a.get("module"),
                    function=a.get("function"),
                    parameters=a.get("parameters", {}),
                    workflow=a.get("workflow"),
                )
            )

        return Skill(
            skill_id=data["skill_id"],
            name=data["name"],
            description=data["description"],
            category=data.get("category", "query"),
            version=data.get("version", "1.0.0"),
            author=data.get("author", "Unknown"),
            date_created=data.get("date_created", ""),
            triggers=triggers,
            parameters=parameters,
            actions=actions,
            safety_level=data.get("safety_level", "query"),
            require_confirmation=data.get("require_confirmation", False),
            read_only=data.get("read_only", False),
            response_template=data.get("response_template", "{{result}}"),
            error_handling=data.get("error_handling", {}),
            examples=data.get("examples", []),
            related_skills=data.get("related_skills", []),
            raw_content=content,
        )

    def list_skills(self) -> List[str]:
        """List all available skill IDs."""
        skills = []
        if self.skills_dir.exists():
            for f in self.skills_dir.glob("*.md"):
                skills.append(f.stem)
        return sorted(skills)

    def get_skill_metadata(self, skill_id: str) -> Optional[Dict]:
        """Get just the metadata for a skill (without full parsing)."""
        skill_file = self.skills_dir / f"{skill_id}.md"
        if not skill_file.exists():
            return None

        content = skill_file.read_text()
        pattern = r"^---\s*\n(.*?)\n---"
        match = re.match(pattern, content, re.DOTALL)

        if match:
            return yaml.safe_load(match.group(1))
        return None


# Global parser instance
_parser = None


def get_parser() -> SkillParser:
    """Get or create global parser instance."""
    global _parser
    if _parser is None:
        _parser = SkillParser()
    return _parser


def parse_skill(skill_id: str) -> Optional[Skill]:
    """Parse a skill by ID."""
    return get_parser().parse_skill(skill_id)


def list_skills() -> List[str]:
    """List all available skills."""
    return get_parser().list_skills()
