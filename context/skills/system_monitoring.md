---
skill_id: system_monitoring
name: System Monitoring Setup
description: Create a system status dashboard with automated monitoring and alerting
category: workflow
version: 1.0.0
author: Atlas System
date_created: 2026-02-06

triggers:
  - pattern: "build me a system status dashboard"
    confidence: 0.95
  - pattern: "create a system monitoring dashboard"
    confidence: 0.95
  - pattern: "set up system monitoring"
    confidence: 0.90
  - pattern: "system status dashboard"
    confidence: 0.85
  - pattern: "monitor the Atlas system"
    confidence: 0.90
  - pattern: "dashboard for system status"
    confidence: 0.85
  - pattern: "network monitoring dashboard"
    confidence: 0.90
  - pattern: "monitor network status"
    confidence: 0.85

parameters:
  - name: components
    type: array
    required: false
    description: What to monitor (network, disk, memory, cpu, builds, cron)
    default: ["network", "system", "builds"]
  
  - name: interval
    type: string
    required: false
    description: How often to check status
    default: "hourly"
  
  - name: include_cron
    type: boolean
    required: false
    description: Also create a cron job for automated updates
    default: true

safety_level: action
require_confirmation: true
confirmation_message: |
  I'll create a comprehensive system monitoring dashboard that includes:
  
  📊 **Dashboard**: Visual system status display
  🔄 **Auto-refresh**: Updates {{interval}}
  📱 **Telegram notifications**: Alerts on issues
  ⏰ **Cron job**: Automated monitoring (optional)
  
  This will create files in `apps/system-monitor/` and set up monitoring.
  
  Proceed?

actions:
  - id: create_dashboard
    type: python_function
    module: tools.skills.actions.system_monitor_actions
    function: create_system_dashboard
    parameters:
      components: "{{components}}"
      interval: "{{interval}}"
      include_cron: "{{include_cron}}"
      user_id: "{{user_id}}"
      chat_id: "{{chat_id}}"

response_template: |
  {% if success %}
  ✅ **System Monitoring Dashboard Created**
  
  📊 **Dashboard Location:**
  `{{dashboard_path}}`
  
  **Quick Launch:**
  ```bash
  open {{dashboard_path}}/index.html
  ```
  
  {% if cron_created %}
  ⏰ **Automated Monitoring:**
  - Job: `{{cron_job_id}}`
  - Schedule: {{interval}}
  - Updates dashboard automatically
  - Sends Telegram notifications
  {% endif %}
  
  **Monitored Components:**
  {% for component in components %}
  - {{component.title()}}
  {% endfor %}
  
  **Features:**
  ✅ Real-time system status
  ✅ Network connectivity check
  ✅ Disk & memory usage
  ✅ Build job status
  ✅ Cron job health
  ✅ Telegram alerts
  
  You'll receive notifications when issues are detected.
  {% else %}
  ❌ **Dashboard Creation Failed**
  
  {{error}}
  
  Try again or check logs for details.
  {% endif %}

error_handling:
  on_validation_error:
    action: ask_user
    message: "What would you like to monitor? (network, system, builds, all)"
  
  on_execution_error:
    action: show_error
    message: "Couldn't create the monitoring dashboard. Check that the apps/ directory is writable."

examples:
  - input: "Build me a system status dashboard"
    output: "Created dashboard with network, system, and build monitoring"
  
  - input: "Monitor network status every hour"
    output: "Created network monitoring dashboard with hourly updates"
  
  - input: "Set up system monitoring with cron job"
    output: "Created dashboard + automated cron job for monitoring"

related_skills:
  - create_cron_job
  - db_query
  - build_app
---

# System Monitoring Dashboard

Creates a comprehensive monitoring solution with dashboard + automated checks.

## What Gets Created

### 1. Dashboard (`apps/system-monitor/`)
- **index.html** - Visual dashboard
- **status.json** - Live system data
- **README.md** - Launch instructions

### 2. Monitoring Script
- Checks network connectivity
- Monitors disk space
- Tracks memory/CPU usage
- Lists active builds
- Shows cron job status

### 3. Cron Job (optional)
- Runs monitoring script on schedule
- Updates dashboard data
- Sends Telegram notifications on issues

## Dashboard Features

**Network Status:**
- Internet connectivity (ping to 8.8.8.8)
- Response time tracking
- Connection history

**System Health:**
- Disk usage (warning at 80%)
- Memory usage
- CPU load
- Uptime

**Atlas Specific:**
- Active build sessions
- Recent build history
- Cron job status
- Failed jobs

**Visual Elements:**
- Green/Yellow/Red status indicators
- Historical graphs
- Last update timestamp
- Mobile-responsive design

## Automated Alerts

Get Telegram notifications for:
- Network disconnection
- Disk space > 80%
- Failed builds
- Cron job failures
- System errors

## Customization

Edit `apps/system-monitor/config.json` to:
- Change check intervals
- Add custom checks
- Modify alert thresholds
- Add more components
