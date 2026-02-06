---
skill_id: db_query
name: Database Query
description: Execute SQL queries against the memory database
category: query
version: 1.0.0
author: Atlas System
date_created: 2026-02-05

triggers:
  - pattern: "query database {sql}"
    confidence: 0.95
  - pattern: "run query {sql}"
    confidence: 0.90
  - pattern: "execute sql {sql}"
    confidence: 0.90
  - pattern: "show me {table}"
    confidence: 0.80
  - pattern: "count {table}"
    confidence: 0.75
  - pattern: "what's in {table}"
    confidence: 0.70

parameters:
  - name: sql
    type: string
    required: true
    description: SQL query to execute
    validation:
      allowed_prefixes: ["SELECT", "SHOW", "PRAGMA", "EXPLAIN"]
      blocked_keywords: ["DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "CREATE"]
  
  - name: format
    type: string
    required: false
    default: table
    enum: [table, json, csv]
    description: Output format

safety_level: query
require_confirmation: false
read_only: true

actions:
  - id: execute_query
    type: python_function
    module: tools.skills.actions.db_actions
    function: execute_read_query
    parameters:
      sql: "{{sql}}"
      format: "{{format}}"

response_template: |
  {% if error %}
  ❌ **Query Error:** {{error}}
  
  I can only execute SELECT, SHOW, PRAGMA, and EXPLAIN queries for safety.
  {% elif results %}
  📊 **Query Results** ({{results|length}} rows)
  
  {% if format == 'table' %}
  ```
  {% for row in results[:20] %}
  {{row}}
  {% endfor %}
  {% if results|length > 20 %}
  ... and {{results|length - 20}} more rows
  {% endif %}
  ```
  {% else %}
  {{results}}
  {% endif %}
  {% else %}
  📊 Query executed successfully. No results returned.
  {% endif %}

error_handling:
  on_validation_error:
    action: reject_with_explanation
    message: "I can only run read-only queries (SELECT, SHOW). I cannot modify the database."
  
  on_execution_error:
    action: show_error
    message: "There was an error executing your query. Please check the SQL syntax."

examples:
  - input: "query database SELECT COUNT(*) FROM memory_entries"
    output: "📊 Query Results: 1,245 memories stored"
  
  - input: "show me recent builds"
    output: "📊 Query Results (5 rows)..."

available_tables:
  - memory_entries
  - daily_logs
  - tasks
  - build_sessions
  - build_output
  - cron_jobs
  - cron_job_history
  - telegram_sessions
  - telegram_messages

related_skills:
  - memory_search
  - db_schema
---

# Database Query

Execute read-only SQL queries against the Atlas database.

## Safety

- **Read-only only** - No modifications allowed
- **Validation** - Checks for dangerous keywords
- **Logging** - All queries logged for audit

## Available Tables

- `memory_entries` - Stored memories and facts
- `daily_logs` - Daily activity logs
- `tasks` - Task tracking
- `build_sessions` - Build job history
- `cron_jobs` - Scheduled jobs
- `telegram_sessions` - Chat sessions

## Examples

```sql
-- Count memories
SELECT COUNT(*) FROM memory_entries WHERE entry_type = 'fact'

-- Recent builds
SELECT * FROM build_sessions ORDER BY created_at DESC LIMIT 5

-- Active cron jobs
SELECT job_id, name, schedule FROM cron_jobs WHERE status = 'active'
```
