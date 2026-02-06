---
skill_id: memory_search
name: Memory Search
description: Search across memory entries using semantic and keyword search
category: query
version: 1.0.0
author: Atlas System
date_created: 2026-02-05

triggers:
  - pattern: "search my memory for {query}"
    confidence: 0.95
  - pattern: "search memory for {query}"
    confidence: 0.95
  - pattern: "find in my memory {query}"
    confidence: 0.95
  - pattern: "find in memory {query}"
    confidence: 0.90
  - pattern: "look up {query} in my memory"
    confidence: 0.90
  - pattern: "look up {query} in memory"
    confidence: 0.85
  - pattern: "what do I know about {query}"
    confidence: 0.85
  - pattern: "search for {query}"
    confidence: 0.70
    context_required: true
  - pattern: "find {query}"
    confidence: 0.65
    context_required: true

parameters:
  - name: query
    type: string
    required: true
    description: The search query
    validation:
      min_length: 3
      max_length: 500
  
  - name: limit
    type: integer
    required: false
    default: 10
    description: Maximum number of results
    validation:
      min: 1
      max: 50
  
  - name: type
    type: string
    required: false
    default: null
    description: Filter by entry type (fact, event, preference, etc.)
    enum: [fact, event, preference, task, insight, relationship]

safety_level: query
require_confirmation: false

actions:
  - id: search
    type: python_function
    module: tools.skills.actions.memory_actions
    function: search_memory
    parameters:
      query: "{{query}}"
      limit: "{{limit}}"
      entry_type: "{{type}}"

response_template: |
  {% if results %}
  🔍 **Found {{results|length}} memories about "{{query}}":**
  
  {% for result in results %}
  **{{loop.index}}.** {{result.content[:200]}}{% if result.content|length > 200 %}...{% endif %}
  _Type: {{result.entry_type}} | Relevance: {{result.score|round(2)}}_
  {% endfor %}
  
  {% if results|length == limit %}
  _Showing top {{limit}} results. Use a more specific query to narrow down._
  {% endif %}
  {% else %}
  🤔 I don't have any memories about "{{query}}" yet.
  
  Would you like me to remember something about this topic?
  {% endif %}

error_handling:
  on_validation_error:
    action: ask_user
    message: "Could you provide a more specific search term? (at least 3 characters)"
  
  on_execution_error:
    action: apologize_and_log
    message: "I had trouble searching your memory. Let me try a different approach."
    log_level: error

examples:
  - input: "Search my memory for Docker setup"
    output: "Found 5 memories about Docker..."
  
  - input: "What do I know about Kubernetes?"
    output: "I found 3 entries about Kubernetes..."

related_skills:
  - memory_add
  - memory_recall_date
  - memory_summarize
---

# Memory Search

Search across all stored memories using semantic similarity and keyword matching.

## When to Use

- User asks about something they mentioned before
- User wants to recall past information
- Connecting current context to previous discussions

## Usage Examples

**Direct Search:**
```
User: "Search my memory for Docker setup"
Atlas: 🔍 Found 3 memories...
```

**Conversational:**
```
User: "What do I know about that project?"
Atlas: 🔍 Found 5 memories about recent projects...
```

## Limitations

- Searches only stored memories (not real-time data)
- Semantic search requires 3+ character queries
- Results limited to 50 entries per query

## See Also

- `memory_add` - Add new memories
- `memory_recall_date` - Find memories by date
