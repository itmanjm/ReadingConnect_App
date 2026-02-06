---
skill_id: launch_build
name: Launch Build or Dashboard
description: Open or launch a previously built project or dashboard
category: query
version: 1.0.0
author: Atlas System
date_created: 2026-02-06

triggers:
  - pattern: "launch {build_name}"
    confidence: 0.95
  - pattern: "open {build_name}"
    confidence: 0.95
  - pattern: "show me {build_name}"
    confidence: 0.90
  - pattern: "start {build_name}"
    confidence: 0.85
  - pattern: "run {build_name}"
    confidence: 0.80
  - pattern: "where is {build_name}"
    confidence: 0.85
  - pattern: "the {build_name} you built"
    confidence: 0.90
  - pattern: "that {build_name}"
    confidence: 0.80
    context_required: true
  - pattern: "it"
    confidence: 0.70
    context_required: true

parameters:
  - name: build_name
    type: string
    required: true
    description: Name of the build/dashboard to launch
  
  - name: from_context
    type: boolean
    required: false
    default: false
    description: Whether build_name was inferred from conversation context

safety_level: query
require_confirmation: false

actions:
  - id: find_and_launch
    type: python_function
    module: tools.skills.actions.launch_actions
    function: find_and_launch_build
    parameters:
      build_name: "{{build_name}}"
      from_context: "{{from_context}}"
      user_id: "{{user_id}}"
      chat_id: "{{chat_id}}"

response_template: |
  Launching {{build_name}}
  
  Location:
  {{project_path}}
  
  Launch Command:
  {{launch_command}}
  
  Built: {{created_at}}
  
  Quick Access:
  {{quick_access}}

error_handling:
  on_not_found:
    action: suggest_recent_builds
    message: "I couldn't find that build. Here are your recent builds:"

examples:
  - input: "Launch the system dashboard"
    output: "Opening apps/system-monitor/index.html"
  
  - input: "Open the dashboard you built"
    context: "Previous: Built system monitoring dashboard"
    output: "Launching system-monitor..."
  
  - input: "Where is it?"
    context: "Previous: Created build"
    output: "Your build is at apps/..."

related_skills:
  - build_app
  - system_monitoring
  - create_cron_job
---

# Launch Build

Opens or launches previously built projects.

## Context Awareness

This skill can understand references like:
- "it" (referring to previous build)
- "the dashboard" (referring to last dashboard built)
- "that build" (referring to recent build in conversation)

## How It Works

1. **Search build history** - Checks database for recent builds
2. **Match by name** - Looks for partial name matches
3. **Context fallback** - If no match, uses last build from conversation
4. **Generate launch command** - Provides appropriate command to open

## Supported Build Types

| Build Type | Launch Command |
|------------|----------------|
| HTML Dashboard | `open apps/{name}/index.html` |
| Python Script | `python apps/{name}/main.py` |
| Web App | `open apps/{name}/index.html` |
| Any folder | `open apps/{name}/` |

## Usage

**Direct reference:**
```
User: Launch the network monitor
Atlas: Opening apps/network-monitor/index.html
```

**Context reference:**
```
User: Build me a dashboard
Atlas: Created apps/my-dashboard/
User: Launch it
Atlas: Opening apps/my-dashboard/index.html
```

**Ambiguous reference:**
```
User: Open the dashboard
Atlas: Found 2 dashboards:
       1. system-monitor
       2. analytics-dashboard
       Which one?
```
