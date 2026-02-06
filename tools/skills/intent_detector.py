#!/usr/bin/env python3
"""
Intent Detector

Detects user intent from natural language and matches to skills.
Uses pattern matching with confidence scoring.
"""

import sys
import re
from pathlib import Path
from typing import List, Optional, Dict, Any
from dataclasses import dataclass
from difflib import SequenceMatcher

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from tools.skills.skill_parser import list_skills, parse_skill, Skill


@dataclass
class IntentMatch:
    skill_id: str
    confidence: float
    parameters: Dict[str, Any]
    matched_trigger: str


class IntentDetector:
    """Detect user intent and match to skills."""

    def __init__(self, min_confidence: float = 0.7):
        self.min_confidence = min_confidence
        self._skills_cache = None

    def _get_all_skills(self) -> List[Skill]:
        """Load all available skills."""
        if self._skills_cache is None:
            self._skills_cache = []
            for skill_id in list_skills():
                skill = parse_skill(skill_id)
                if skill:
                    self._skills_cache.append(skill)
        return self._skills_cache

    def detect(self, message: str) -> Optional[IntentMatch]:
        """
        Detect intent from user message.
        Returns best matching skill or None.
        """
        message_lower = message.lower().strip()
        best_match = None
        best_confidence = 0.0

        for skill in self._get_all_skills():
            for trigger in skill.triggers:
                confidence, params = self._match_trigger(
                    message_lower, trigger.pattern, skill.parameters
                )

                if confidence > best_confidence and confidence >= self.min_confidence:
                    best_confidence = confidence
                    best_match = IntentMatch(
                        skill_id=skill.skill_id,
                        confidence=confidence,
                        parameters=params,
                        matched_trigger=trigger.pattern,
                    )

        return best_match

    def _match_trigger(
        self, message: str, pattern: str, skill_params: List[Any]
    ) -> tuple:
        """
        Match message against trigger pattern.
        Returns (confidence, extracted_params).
        """
        pattern_lower = pattern.lower()

        # Check for parameter placeholders {param_name}
        param_pattern = r"\{(\w+)\}"
        param_names = re.findall(param_pattern, pattern_lower)

        if param_names:
            # Pattern has parameters - use regex matching
            regex_pattern = re.escape(pattern_lower)
            for param_name in param_names:
                regex_pattern = regex_pattern.replace(
                    f"\\{{{param_name}\\}}", f"(?P<{param_name}>.+)"
                )

            match = re.search(regex_pattern, message, re.IGNORECASE)
            if match:
                # Extract parameters
                params = match.groupdict()

                # Calculate confidence based on match quality
                matched_text = match.group(0)
                confidence = self._calculate_confidence(message, matched_text, pattern)

                return confidence, params

            return 0.0, {}

        else:
            # No parameters - check for containment or similarity
            if pattern_lower in message:
                # Direct containment is high confidence
                confidence = 0.85
                return confidence, {}

            # Check word overlap
            confidence = self._word_overlap_confidence(message, pattern_lower)
            return confidence, {}

    def _calculate_confidence(
        self, message: str, matched_text: str, pattern: str
    ) -> float:
        """Calculate confidence score for a match."""
        # Base confidence
        confidence = 0.7

        # Boost if match covers most of the message
        coverage = len(matched_text) / len(message)
        if coverage > 0.8:
            confidence += 0.15
        elif coverage > 0.5:
            confidence += 0.05

        # Boost for exact matches vs partial
        if matched_text.lower() == message.lower():
            confidence += 0.1

        return min(confidence, 1.0)

    def _word_overlap_confidence(self, message: str, pattern: str) -> float:
        """Calculate confidence based on word overlap."""
        message_words = set(message.lower().split())
        pattern_words = set(pattern.lower().split())

        if not pattern_words:
            return 0.0

        overlap = len(message_words & pattern_words)
        confidence = overlap / len(pattern_words)

        # Use sequence matcher for similarity
        similarity = SequenceMatcher(None, message, pattern).ratio()

        # Combine scores
        return min((confidence * 0.6 + similarity * 0.4), 0.75)

    def extract_parameters(self, message: str, skill: Skill) -> Dict[str, Any]:
        """Extract parameters from message based on skill definition."""
        params = {}

        for param in skill.parameters:
            value = self._extract_parameter(message, param)
            if value is not None:
                params[param.name] = value
            elif param.required and param.default is not None:
                params[param.name] = param.default

        return params

    def _extract_parameter(self, message: str, param: Any) -> Any:
        """Extract a single parameter from message."""
        # Try to find parameter value in message
        # This is a simplified version - could be enhanced with NLP

        if param.type == "integer":
            # Look for numbers
            numbers = re.findall(r"\b(\d+)\b", message)
            if numbers:
                return int(numbers[0])

        elif param.type == "string":
            # Look for quoted strings or content after keywords
            quoted = re.findall(r'"([^"]+)"', message)
            if quoted:
                return quoted[0]

            # Look for 'for X' or 'about X' patterns
            for pattern in [
                r"for\s+(.+?)(?:\s+(?:in|on|at)\s|$)",
                r"about\s+(.+?)(?:\s|$)",
                r"query\s+(.+?)(?:\s|$)",
            ]:
                match = re.search(pattern, message, re.IGNORECASE)
                if match:
                    return match.group(1).strip()

        return None


# Global detector instance
_detector = None


def get_detector() -> IntentDetector:
    """Get or create global detector instance."""
    global _detector
    if _detector is None:
        _detector = IntentDetector()
    return _detector


def detect_intent(message: str) -> Optional[IntentMatch]:
    """Detect intent from a message."""
    return get_detector().detect(message)
