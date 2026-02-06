---
skill_id: create_cron_job
name: Create Cron Job
description: Create a scheduled cron job to run tasks automatically
category: action
version: 1.0.0
author: Atlas System
date_created: 2026-02-06

triggers:
  - pattern: "schedule {task} every {interval}"
    confidence: 0.95
  - pattern: "create a cron job to {task}"
    confidence: 0.95
  - pattern: "run {task} every {interval}"
    confidence: 0.90
  - pattern: "set up {interval} {task}"
    confidence: 0.85
  - pattern: "cron job for {task}"
    confidence: 0.90
  - pattern: "automate {task}"
    confidence: 0.80
  - pattern: "schedule {task}"
    confidence: 0.75
  - pattern: "{task} every hour"
    confidence: 0.90
  - pattern: "{task} hourly"
    confidence: 0.90
  - pattern: "hourly {task}"
    confidence: 0.85
  - pattern: "check {task} every hour"
    confidence: 0.90

parameters:
  - name: task
    type: string
    required: true
    description: The task to schedule (e.g., "network check", "backup", "youtube monitoring")
  
  - name: interval
    type: string
    required: false
    description: How often to run (e.g., "hourly", "daily", "every 6 hours", "every Monday")
    default: "daily"
  
  - name: command
    type: string
    required: false
    description: Specific command to run (if not inferred from task)
  
  - name: builder
    type: string
    required: false
    default: "opencode"
    enum: [opencode, claude]

safety_level: action
require_confirmation: false

actions:
  - id: create_cron
    type: python_function
    module: tools.skills.actions.cron_actions
    function: create_job_from_natural_language
    parameters:
      task: "{{task}}"
      interval: "{{interval}}"
      command: "{{command}}"
      user_id: "{{user_id}}"
      chat_id: "{{chat_id}}"

response_template: |
  {% if success %}
  ✅ **Cron Job Created & Active**
  
  **Job:** {{job_name}}
  **ID:** `{{job_id}}`
  **Schedule:** {{schedule}}
  **Next Run:** {{next_run}}
  
  🔔 **Proactive Notifications Enabled**
  You'll receive Telegram updates automatically every time this job runs - no need to check manually!
  
  Use `/cron history {{job_id}}` to see execution history.
  Use `/cron pause {{job_id}}` to temporarily stop notifications.
  {% else %}
  ❌ **Failed to Create Cron Job**
  
  {{error}}
  
  Try being more specific about what to schedule and how often.
  {% endif %}

error_handling:
  on_validation_error:
    action: ask_user
    message: "I need more details. What task should I schedule and how often? (e.g., 'check network every hour')"
  
  on_execution_error:
    action: show_error
    message: "Couldn't create the cron job. Please check the syntax and try again."

examples:
  - input: "Schedule network check every hour"
    output: "Created cron job 'network_check' running every hour"
  
  - input: "Create a cron job to backup daily"
    output: "Created cron job 'daily_backup' running daily at 2 AM"
  
  - input: "Run YouTube monitoring every 6 hours"
    output: "Created cron job 'youtube_monitor' running every 6 hours"

related_skills:
  - list_cron_jobs
  - delete_cron_job
  - system_monitoring
---

# Create Cron Job

Schedule automated tasks to run at specified intervals.

## Supported Intervals

- **Hourly patterns:** "every hour", "hourly", "every 2 hours"
- **Daily patterns:** "daily", "every day", "every morning"
- **Weekly patterns:** "weekly", "every Monday", "every week"
- **Specific times:** "at 2 AM", "at 8:30 PM"

## Task Types

### System Tasks
- Network monitoring
- System health checks
- Disk space monitoring
- Log rotation

### Build Tasks
- Build workflows
- Goal execution
- YouTube monitoring
- Content automation

### Custom Commands
Any shell command or Python script can be scheduled.

## Safety

Cron jobs run with the same permissions as the Atlas daemon.
Be careful with destructive operations.
