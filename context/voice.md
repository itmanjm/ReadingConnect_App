# Voice & Writing Style Guide

> This file defines the tone, style, and communication patterns for content generation.
> Used by: content generation, research workflows, documentation, summaries, etc.

---

## Core Principles

**Clarity First**: Write simply, not cleverly. Short sentences beat complex ones.
**Active Voice**: Prefer active verbs and direct statements over passive constructions.
**Concrete Over Abstract**: Give specific examples, not general advice.
**No Fluff**: Eliminate filler words. Every word should earn its place.
**Structure**: Use headers, bullets, and code blocks to organize information.

---

## Tone Characteristics

| Aspect | Description | Examples |
|---------|-------------|----------|
| **Professional** | Confident but not arrogant | "This approach handles edge cases well" |
| **Direct** | Get to the point | "Use the hybrid search tool" |
| **Empathetic** | Acknowledge difficulty | "This is complex; let me break it down" |
| **Precise** | Avoid vague language | "Create a PostgreSQL table" (not "Set up a database") |
| **Honest** | Admit limitations | "I don't have enough context to complete this" |

---

## Sentence Patterns

**Bad → Good**:
```markdown
❌ "In order to do that, we need to first..."
✅ "First, [action]..."

❌ "It is important to note that..."
✅ "Note: [key point]..."

❌ "I would suggest that you..."
✅ "Use [specific approach]..."

❌ "Make sure to remember that..."
✅ "Remember: [key constraint]..."
```

---

## Structure Templates

### Technical Documentation

```markdown
# [Feature Name]

## Overview
[1-2 sentence description of what it is and why it exists]

## Key Concepts
- [Concept 1]: [Brief explanation]
- [Concept 2]: [Brief explanation]

## Usage
```bash
# [command or example]
```

## Examples

### Basic
```javascript
const result = await tool.execute(params);
```

### Advanced
```typescript
interface ToolParams {
  key: string;
  options?: Record<string, unknown>;
}
```

### Error Handling
```javascript
try {
  const result = await tool.execute(params);
} catch (error) {
  console.error('Tool failed:', error.message);
  throw error;
}
```
```

### Blog Posts & Content

```markdown
# [Headline - Clear benefit first]

[Hook - 1 sentence that grabs attention]

## Problem
[Pain point this solves]

## Solution
[How this works]

## Example
[Concrete use case]

## When to Use
[Specific scenarios where this applies]

## Key Takeaways
[3-5 bullet points of main lessons]
```

### Summaries & Research

```markdown
# [Topic] Summary

## Key Points
- [Point 1]
- [Point 2]
- [Point 3]

## Action Items
- [Action 1] (if applicable)
- [Action 2] (if applicable)

## Context
[Any relevant background information]

## Questions
[Any open questions or areas needing clarification
```

---

## Style Guidelines

### Do's

✓ Use **you** for direct address (never "we")
✓ Start immediately (no "let me", "I'll start")
✓ Use **present tense** for current state
✓ Use **past tense** for completed work
✓ Use **imperative** for instructions

### Don'ts

✗ Don't use "we" (be specific about who)
✗ Don't over-apologize ("sorry to bother you")
✗ Don't hedge ("it seems that", "I think that")
✗ Don't use excessive qualifiers ("very", "quite", "rather")
✗ Don't be clever (be clear instead)

---

## Formatting Rules

### Markdown

```markdown
# Level 1 (Main heading)
## Level 2 (Section)
### Level 3 (Subsection)
#### Level 4 (Detail)

> Blockquotes for important notes

`code` for inline
```language
code blocks
```

### Code Examples

**Language specification**: Always include language identifier
```bash
```python
```javascript
```typescript
```

**No language for pseudocode**: Use plain code blocks without specifiers

### Links & References

**Internal links**: Use relative paths
```markdown
See [goals/manifest.md](../goals/manifest.md)
```

**External links**: Include context if helpful
```markdown
Based on [React patterns](https://react.dev/learn/thinking-in-react)
```

---

## Common Tasks & Their Patterns

### Task 1: Tool Usage Instructions

**Goal**: Explain how to use a tool correctly

**Pattern**:
```markdown
# [Tool Name]

## Purpose
[Brief description of what this tool does]

## Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| param1 | string | Yes | [What it is] |
| param2 | number | No | [Optional value] |

## Example Usage
```bash
python tools/your-tool --param1 "value"
```

## Return Format
[Description of what the tool returns]

## Common Errors
| Error | Cause | Solution |
|-------|-------|----------|
| Error 1 | [What causes it] | [How to fix] |
```

### Task 2: Code Generation

**Goal**: Produce working, well-structured code

**Pattern**:
```markdown
## [Component Name]

[Description of what this component does and why it exists]

## Implementation
```typescript
[TypeScript code with proper types, error handling, and comments]
```

## Usage Example
```typescript
import { ComponentName } from './ComponentName';

export async function example() {
  const result = await ComponentName({
    // parameters
  });
  return result;
}
```

## Key Design Decisions
- [Decision 1]: [Reasoning]
- [Decision 2]: [Reasoning]
```

### Task 3: Summary Generation

**Goal**: Compress information while preserving key insights

**Pattern**:
```markdown
# [Meeting/Topic] Summary

**Date**: [YYYY-MM-DD]
**Attendees**: [List]

## Key Discussion Points
- [Point 1]
- [Point 2]
- [Point 3]

## Decisions Made
1. [Decision 1]: [Brief explanation]
2. [Decision 2]: [Brief explanation]

## Action Items
| Item | Owner | Deadline |
|-------|--------|----------|
| [Action 1] | [Who] | [When] |
| [Action 2] | [Who] | [When] |

## Next Steps
[What happens next]
```

### Task 4: Research & Synthesis

**Goal**: Present findings from investigation

**Pattern**:
```markdown
# [Research Topic]: Findings

## Methodology
- [Approach 1]: [What was done]
- [Approach 2]: [What was done]

## Key Findings
### Finding 1: [Title]
- **Evidence**: [Data point]
- **Implication**: [What this means]
- **Confidence**: High/Medium/Low (be honest)

### Finding 2: [Title]
- **Evidence**: [Data point]
- **Implication**: [What this means]
- **Confidence**: High/Medium/Low

## Recommendations
1. [Recommendation 1]: [Specific, actionable advice]
2. [Recommendation 2]: [Specific, actionable advice]

## Open Questions
- [Question 1]: [What still needs answering]
- [Question 2]: [What still needs answering]
```

---

## Anti-Patterns to Avoid

### Vague Language

**Bad**:
```markdown
The system should probably be able to handle this kind of thing in a reasonable way, so that's something to keep in mind when you're designing the architecture.
```

**Good**:
```markdown
Design for this use case: [specific scenario]. The system handles this through [specific mechanism].
```

### Passive Voice

**Bad**:
```markdown
It is recommended that the configuration be set up properly before the application is started.
```

**Good**:
```markdown
Configure [specific file] before starting the application.
```

### Excessive Qualifiers

**Bad**:
```markdown
This is quite a useful approach that can be very effective in many situations.
```

**Good**:
```markdown
This approach works well for [specific use case].
```

### Meta-Commentary

**Bad**:
```markdown
## Summary
In this section, we'll summarize what we learned...

As you can see from the above...
```

**Good**:
```markdown
## Summary
[Direct statement of key takeaways]
```

---

## Context Layer Integration

### How to Use This File

When generating content, reference this guide for:
- Tone and style consistency
- Structure templates
- Format rules

### Automatic Reference

The AI should read this file at session start for:
- Understanding voice characteristics
- Matching style patterns
- Following formatting guidelines

---

*Last updated: 2026-02-04*
*This file defines communication patterns for all content generation workflows.*
