---
skill_id: create_skill
name: Create New Skill
description: Teach Atlas a new capability by creating a skill file
category: workflow
version: 1.0.0
author: Atlas System
date_created: 2026-02-05

triggers:
  - pattern: "teach you to {capability}"
    confidence: 0.95
  - pattern: "learn how to {capability}"
    confidence: 0.95
  - pattern: "create a skill to {capability}"
    confidence: 0.95
  - pattern: "I want you to {capability}"
    confidence: 0.80
    requires_followup: true
  - pattern: "add capability to {capability}"
    confidence: 0.85
  - pattern: "new skill: {description}"
    confidence: 0.90

parameters:
  - name: capability
    type: string
    required: true
    description: What the skill should do
  
  - name: name
    type: string
    required: false
    description: Display name for the skill
  
  - name: triggers
    type: array
    required: false
    description: Natural language patterns that trigger this skill
  
  - name: safety_level
    type: string
    required: false
    default: query
    enum: [query, action, danger]
    description: Safety classification

safety_level: action
require_confirmation: true
confirmation_message: |
  I'll create a new skill based on your description.
  
  This will:
  - Create a skill file in context/skills/
  - Add it to my available capabilities
  - Allow natural language triggering
  
  Proceed?

actions:
  - id: create_skill
    type: conversation_workflow
    workflow:
      - step: gather_requirements
        action: ask_questions
        questions:
          - "What should I call this skill? (short name)"
          - "What natural language phrases should trigger it? (e.g., 'check my email')"
          - "What parameters does it need?"
          - "What actions should it perform?"
          - "How should I respond when it's done?"
      
      - step: generate_skill
        action: generate_skill_file
        template: skill_template_v1
      
      - step: validate
        action: validate_skill_schema
        on_error: ask_for_clarification
      
      - step: save
        action: save_skill_file
        path: "context/skills/{{skill_id}}.md"
      
      - step: test
        action: offer_test
        message: "Skill created! Say '{{example_trigger}}' to test it."

response_template: |
  {% if skill_created %}
  ✅ **Skill Created: {{skill_name}}**
  
  I've learned how to {{capability}}. 
  
  **Triggers:**
  {% for trigger in triggers %}
  - "{{trigger}}"
  {% endfor %}
  
  **Try it:** Say "{{example_trigger}}"
  
  **File:** `context/skills/{{skill_id}}.md`
  
  You can edit this file directly to refine the skill.
  {% else %}
  ❌ Skill creation cancelled.
  {% endif %}

conversation_flow: |
  **Phase 1: Discovery**
  
  User: "Teach you to check my GitHub repos"
  
  Atlas: "I'd love to learn that! Let me ask a few questions:
  
  1. What should I call this skill? (e.g., 'github_check')
  2. What phrases should trigger it? (e.g., 'check my repos', 'show GitHub status')
  3. What information should I show? (stars, issues, PRs, commits?)
  4. Do I need any API keys or credentials?"
  
  **Phase 2: Generation**
  
  Atlas generates skill file based on answers
  
  **Phase 3: Testing**
  
  Atlas: "Skill created! Try saying: 'Check my GitHub repos'"
  
  User tests → Atlas confirms or offers to refine

examples:
  - input: "Teach you to summarize my daily logs"
    conversation: |
      Atlas: "Great! What should I call this skill?"
      User: "daily_summary"
      Atlas: "What should trigger it?"
      User: "summarize my day"
      Atlas: "Skill created!"
  
  - input: "Learn to check my email"
    conversation: |
      Atlas: "I'd need email API credentials. Can you provide those?"
      User: provides credentials
      Atlas: "Skill created with secure credential storage!"

related_skills:
  - list_skills
  - edit_skill
  - delete_skill
---

# Create New Skill

Teach Atlas new capabilities through conversation.

## Why This Matters

Instead of memorizing commands, you teach Atlas what you need. The skill system:

- Remembers your specific workflows
- Adapts to your language patterns
- Grows with your needs
- Shares capabilities across sessions

## How It Works

1. **Describe** what you want
2. **Answer** clarifying questions
3. **Test** the new skill
4. **Refine** if needed

## Example: Creating a GitHub Skill

```
User: Teach you to check my GitHub repos

Atlas: What should I call this skill?
User: github_check

Atlas: What phrases should trigger it?
User: "check my repos", "show GitHub status"

Atlas: What information should I display?
User: Open issues and last commit

Atlas: Skill created! Try saying: "Check my repos"
```

## Skill Components

Each skill includes:
- **Triggers** - Natural language patterns
- **Parameters** - What data it needs
- **Actions** - What it does
- **Safety Level** - How dangerous it is
- **Response Template** - How to reply

## Safety First

- query = Read-only, no confirmation
- action = May modify state, ask first
- danger = Destructive, triple confirm
