# Atlas Skills System

> Natural language skill execution and creation for Atlas
> Part of GOTCHA Framework - teachable AI capabilities

---

## Overview

The Skills System allows Atlas to understand natural language requests and execute capabilities without memorizing commands. Like OpenClaw's skills, you teach Atlas new capabilities through conversation.

### Key Features

- **Natural Language**: Say *"Search my memory for Docker notes"* instead of `/memory search Docker`
- **Teachable**: Create new skills by describing what you want
- **Safe**: Safety levels (query/action/danger) with confirmations
- **Auditable**: All skill executions logged
- **GOTCHA-Compliant**: Fits within existing framework (Goals, Tools, Context)

---

## How It Works

### For Users

1. **Speak Naturally**
   ```
   You: "Search my memory for Kubernetes setup"
   Atlas: 🔍 Found 3 memories about Kubernetes...
   ```

2. **Teach New Skills**
   ```
   You: "Teach you to check my GitHub repos"
   Atlas: What should I call this skill?
   You: "github_check"
   Atlas: Skill created! Try saying: "Check my GitHub repos"
   ```

3. **Iterate**
   ```
   You: "That skill should also show open issues"
   Atlas: Skill updated with issue tracking
   ```

### Architecture

```
User Message
    ↓
Intent Detector (tools/skills/intent_detector.py)
    - Match against skill triggers
    - Extract parameters
    - Return confidence score
    ↓
Skill Parser (tools/skills/skill_parser.py)
    - Load skill markdown file
    - Parse YAML frontmatter
    - Extract actions
    ↓
Skill Executor (tools/skills/skill_executor.py)
    - Validate parameters
    - Execute Python/shell actions
    - Format response
    - Log execution
    ↓
Response to User
```

---

## File Structure

```
context/skills/                    # Skill definitions (markdown)
├── memory_search.md              # Search memory system
├── db_query.md                   # Query database
├── create_skill.md               # Create new skills
└── [your_custom_skills].md       # User-created skills

tools/skills/
├── skill_parser.py               # Parse skill markdown
├── intent_detector.py            # Match NL to skills
├── skill_executor.py             # Execute skill actions
├── skill_creator.py              # Create skills via conversation
└── actions/
    ├── memory_actions.py         # Memory system actions
    └── db_actions.py             # Database actions

goals/execute_skill.md            # Goal definition for skill execution
```

---

## Creating a New Skill

### Option 1: Natural Language (Recommended)

```
You: Teach you to summarize my daily logs
Atlas: What should I call this skill?
You: "daily_summary"
Atlas: What phrases should trigger it?
You: "Summarize my day", "What did I do today?"
Atlas: Skill created!
```

### Option 2: Direct File Creation

Create `context/skills/my_skill.md`:

```yaml
---
skill_id: my_skill
name: My Custom Skill
description: Does something useful
category: query

triggers:
  - pattern: "do {thing}"
    confidence: 0.95

parameters:
  - name: thing
    type: string
    required: true

safety_level: query
require_confirmation: false

actions:
  - id: do_thing
    type: python_function
    module: tools.skills.actions.my_actions
    function: do_something
    parameters:
      thing: "{{thing}}"

response_template: |
  Done! You asked me to do: {{thing}}
---

# My Custom Skill

Description here...
```

---

## Built-in Skills

### 1. Memory Search

**Triggers:**
- "Search my memory for {query}"
- "What do I know about {query}?"
- "Find in memory {query}"

**Example:**
```
You: Search my memory for Docker setup
Atlas: 🔍 Found 5 memories about Docker setup...
```

### 2. Database Query

**Triggers:**
- "Query database {sql}"
- "Run query {sql}"
- "Show me {table}"

**Example:**
```
You: Query database SELECT COUNT(*) FROM memory_entries
Atlas: 📊 Query Results: 1,245 memories stored
```

### 3. Create Skill

**Triggers:**
- "Teach you to {capability}"
- "Learn how to {capability}"
- "Create a skill to {capability}"

**Example:**
```
You: Teach you to check my email
Atlas: What should I call this skill?
...
```

---

## Safety Levels

| Level | Description | Confirmation | Examples |
|-------|-------------|--------------|----------|
| **query** | Read-only data retrieval | None needed | memory_search, db_query |
| **action** | Modifies state | "Execute?" | build_trigger, cron_create |
| **danger** | Destructive operations | "DANGER: Confirm 3x" | shell_execute, delete |

---

## Integration with Telegram Bot

Skills are automatically integrated into the daemon's message handling:

1. User sends message
2. Intent detector checks for skill match (confidence ≥ 0.7)
3. If matched → Execute skill → Return formatted response
4. If not matched → Fall back to Z.ai response

**Flow:**
```python
User Message
    ↓
Check for "build" keyword → Build system
    ↓
Skill Intent Detection → Skills system (NEW)
    ↓
Session management
    ↓
Z.ai response (fallback)
```

---

## Comparison: Atlas Skills vs OpenClaw

| Feature | OpenClaw | Atlas Skills |
|---------|----------|--------------|
| **Trigger** | Natural language | Natural language ✓ |
| **Creation** | Conversation | Conversation ✓ |
| **Storage** | Markdown files | Markdown files ✓ |
| **Safety** | Context-dependent | Explicit levels ✓ |
| **Framework** | Custom | GOTCHA-compliant ✓ |
| **Logging** | Basic | Full audit trail ✓ |
| **Teaching** | Interactive | Interactive ✓ |

---

## Extending Capabilities

### Add New Action Type

Edit `tools/skills/skill_executor.py`:

```python
def _execute_action(self, action, params, skill):
    if action.action_type == "my_custom_action":
        return self._execute_my_action(action, params)
    # ... existing types
```

### Add New Skill

1. Create `context/skills/my_skill.md`
2. Define triggers, parameters, actions
3. Test: "Trigger phrase for my skill"
4. Iterate

---

## Configuration

Skills require no additional configuration - they're automatically discovered from `context/skills/` directory.

### Optional: Skill Args

Create `args/skills.yaml`:

```yaml
skills:
  default_safety_level: query
  min_confidence: 0.7
  max_execution_time: 300
  
  disabled_skills:
    - dangerous_skill
```

---

## Testing

```bash
# Test skill detection
cd /Users/zero/Documents/Projects/Atlas
python3 -c "
from tools.skills.intent_detector import detect_intent
intent = detect_intent('Search my memory for Docker')
print(f'Skill: {intent.skill_id}, Confidence: {intent.confidence}')
"

# Test skill execution
python3 -c "
from tools.skills.skill_parser import parse_skill
from tools.skills.skill_executor import execute_skill
skill = parse_skill('memory_search')
result = execute_skill(skill, {'query': 'test'})
print(result)
"
```

---

## Roadmap

- [ ] Interactive skill creation conversation
- [ ] Skill versioning and rollback
- [ ] Skill marketplace/sharing
- [ ] Multi-step workflow skills
- [ ] Conditional skill execution
- [ ] Skill chaining (output of one → input of next)

---

*Part of ATLAS System - GOTCHA Framework*
