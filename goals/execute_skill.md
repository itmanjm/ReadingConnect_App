# Skill Execution Goal

> Execute user requests by loading and running appropriate skills.
> Skills are teachable capabilities stored as markdown files.

---

## Overview

Atlas uses a **Skills System** to handle natural language requests. Instead of memorizing commands, users teach Atlas capabilities through conversation.

**Key Principles:**
- Skills are self-documenting markdown files
- Natural language triggers skill execution
- Skills can be created through conversation
- Execution is sandboxed and logged

---

## A — ARCHITECT

### Problem Statement

Users cannot remember dozens of `/commands`. They want to:
- Speak naturally: *"Search my memory for Docker notes"*
- Teach new capabilities: *"Learn to check my GitHub repos"*
- Iterate on skills: *"That skill should also show open issues"*

### Solution

**Skills Architecture:**

```
context/skills/           # Skill definitions
├── memory_search.md      # How to search memory
├── db_query.md          # How to query database
├── shell_execute.md     # How to run shell commands
├── github_check.md      # How to check GitHub repos
└── [user_created].md    # Custom skills

tools/skills/
├── skill_parser.py      # Parse skill markdown
├── skill_executor.py    # Execute skill actions
├── skill_creator.py     # Create new skills via conversation
└── intent_detector.py   # Match natural language to skills
```

### Success Metrics

- [ ] 90% of requests handled via natural language (no commands)
- [ ] New skill created in <5 minutes of conversation
- [ ] Skill execution logged and auditable
- [ ] Skills are versioned and reversible

---

## T — TRACE

### Skill Schema

Each skill is a markdown file with YAML frontmatter:

```yaml
---
skill_id: memory_search
name: Memory Search
description: Search the memory system for relevant information
triggers:
  - "search memory for {query}"
  - "find in memory {query}"
  - "look up {query} in memory"
  - "what do I know about {query}"
parameters:
  - name: query
    type: string
    required: true
    description: What to search for
  - name: limit
    type: integer
    required: false
    default: 10
    description: Maximum results to return
actions:
  - type: python
    code: |
      from tools.memory import hybrid_search
      results = hybrid_search(query, limit)
      return results
validation:
  - query must be at least 3 characters
  - limit must be between 1 and 100
---

# Memory Search Skill

## Purpose
Search across all memory entries using semantic + keyword search.

## Examples

**User:** "Search my memory for Docker setup"
**Action:** Run hybrid search for "Docker setup"
**Response:** "I found 5 entries about Docker setup..."

## Edge Cases

- If no results: "I don't have any memories about that yet."
- If query too short: Ask user to be more specific
- If error: Log and offer to search with different terms
```

### Skill Types

1. **query** - Read-only data retrieval (safe)
2. **action** - Modify state (requires confirmation)
3. **workflow** - Multi-step process with dependencies
4. **integration** - External API calls

### Integration Points

| System | Purpose | Access Level |
|--------|---------|--------------|
| Memory DB | Store/retrieve memories | Read/Write |
| Build System | Trigger builds | Action (confirm) |
| Cron System | Schedule jobs | Action (confirm) |
| Shell | Execute commands | Action (high confirm) |
| External APIs | GitHub, SendGrid, etc | Integration |

---

## L — LINK

### Validation Checklist

- [ ] Skill file exists and is valid markdown
- [ ] Skill schema validates against spec
- [ ] User has permission to execute skill type
- [ ] Parameters pass validation rules
- [ ] Actions are executable

### Safety Levels

| Level | Skills | Confirmation |
|-------|--------|--------------|
| query | memory_search, db_query | None |
| action | build_trigger, cron_create | "Execute?" |
| danger | shell_execute, delete | "DANGER: Confirm 3x" |

---

## A — ASSEMBLE

### Execution Flow

1. **Intent Detection**
   ```python
   user_message = "Search my memory for Docker notes"
   detected_skill = detect_intent(user_message)
   # → skill_id: "memory_search"
   # → parameters: {"query": "Docker notes"}
   ```

2. **Skill Loading**
   ```python
   skill = load_skill(detected_skill.skill_id)
   validate_skill(skill)
   ```

3. **Parameter Extraction**
   ```python
   params = extract_parameters(user_message, skill.triggers)
   validate_parameters(params, skill.validation)
   ```

4. **Execution**
   ```python
   if skill.safety_level in ["action", "danger"]:
       ask_confirmation(skill, params)
   
   result = execute_skill(skill, params)
   log_execution(skill, params, result)
   ```

5. **Response**
   ```python
   natural_response = format_result(result, skill.response_template)
   send_to_user(natural_response)
   ```

### Skill Creation Flow

1. **User Request**
   - User: *"I want you to learn how to check my GitHub repos"*

2. **Clarification Questions**
   - Atlas: "What information should I show? Stars, issues, PRs?"
   - User: "Show open issues and last commit date"

3. **Skill Generation**
   - Parse requirements
   - Generate skill markdown
   - Validate schema
   - Save to `context/skills/github_check.md`

4. **Testing**
   - Atlas: "Skill created. Test it by saying: 'Check my GitHub repos'"
   - User tests → Atlas refines if needed

5. **Activation**
   - Skill immediately available
   - Triggers added to intent detector

---

## S — STRESS-TEST

### Test Scenarios

**Intent Detection:**
- [ ] "Search memory for Docker" → memory_search
- [ ] "Find my notes about Kubernetes" → memory_search
- [ ] "Run a backup" → shell_execute (with confirmation)
- [ ] "Build a dashboard" → build_trigger

**Skill Creation:**
- [ ] Create skill through conversation
- [ ] Test newly created skill
- [ ] Update existing skill
- [ ] Delete skill

**Edge Cases:**
- [ ] Ambiguous intent → Ask for clarification
- [ ] Missing parameter → Prompt user
- [ ] Skill execution fails → Graceful error
- [ ] Invalid skill file → Skip and log

---

## Implementation

### Tools to Build

1. `tools/skills/skill_parser.py` - Parse skill markdown
2. `tools/skills/skill_executor.py` - Execute skill actions
3. `tools/skills/intent_detector.py` - Match NL to skills
4. `tools/skills/skill_creator.py` - Create skills via conversation
5. `tools/skills/skill_manager.py` - CRUD operations

### Integration

Hook into `handle_message()` in daemon.py:

```python
async def handle_message(self, update, context):
    # Try intent detection first
    intent = await detect_intent(message.text)
    
    if intent.confidence > 0.7:
        # Execute skill
        result = await execute_skill(intent)
        await message.reply_text(result)
        return
    
    # Fall back to Z.ai response
    await self.handle_zai_response(message)
```

---

*Part of ATLAS System - GOTCHA Framework*
