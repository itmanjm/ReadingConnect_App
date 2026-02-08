# Positive Examples

> Examples of good output, patterns, and approaches.
> Use as reference when quality is needed.

---

## Example 1: Clear Tool Documentation

**Source**: A well-structured tool README

```markdown
# memory_search.py

## Purpose
Search memory entries by keyword, type, or importance.

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|-----------|-------------|
| query | string | Yes | - | Search term to find in memory |
| type | string | No | - | Filter by entry type (fact, preference, etc.) |
| limit | integer | No | 10 | Maximum number of results to return |
| importance | integer | No | - | Minimum importance threshold (1-10) |

## Usage

```bash
# Search for facts about GPT
python tools/memory/memory_db.py --action search --query "GPT" --type fact --importance 7

# Get top 5 preferences
python tools/memory/memory_db.py --action search --limit 5 --type preference
```

## Return Format

Returns JSON array of memory entries:

```json
[
  {
    "id": 123,
    "content": "User prefers concise responses over long explanations",
    "type": "preference",
    "importance": 8,
    "created_at": "2026-02-04T12:00:00Z",
    "access_count": 15
  }
]
```

## Why This Works

✓ **Clear purpose**: First line explains what it does
✓ **Structured parameters**: Table makes options scannable
✓ **Concrete examples**: Actual commands you can run
✓ **Defined output format**: Shows exactly what you get back
✓ **No fluff**: Every section adds value, no filler content
```

---

## Example 2: Direct Problem Solving

**Source**: Focused technical response

```markdown
The memory database schema is missing the embedding column documented in memory_db.py.

To fix this, update the schema:

```sql
ALTER TABLE memory_entries ADD COLUMN embedding BLOB;
CREATE INDEX IF NOT EXISTS idx_memory_entries_embedding ON memory_entries(embedding);
```

Run the migration:

```bash
python tools/memory/embed_memory.py --migrate
```

This will align the actual database with the documented schema.
```

**Why This Works**:

✓ **Identifies the problem directly**: First sentence states what's wrong
✓ **Provides concrete solution**: SQL to run, not just "fix it"
✓ **Explains why**: Bridges the gap between docs and reality
✓ **Actionable**: Commands to execute
✓ **No hedging**: Doesn't use "seems like", "probably should"
✓ **Efficient**: Addresses the root cause, not symptoms
```

---

## Example 3: Clear Goal Workflow

**Source**: A well-structured goal following ATLAS pattern

```markdown
# research_lead.md

## Goal

Research and validate potential leads from LinkedIn before outreach.

## Trace Phase

### Data Schema

```sql
CREATE TABLE leads (
    id INTEGER PRIMARY KEY,
    linkedin_url TEXT UNIQUE NOT NULL,
    full_name TEXT,
    company TEXT,
    title TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Integration Map

| Service | Purpose | API Type | Auth Method | Status |
|---------|---------|-----------|-------------|---------|
| LinkedIn | Profile data | API Key | Credentials | Ready |
| Clearbit | Company enrichment | API Key | Credentials | Need test |

## Link Phase

### Connection Validation

- [ ] Database connection tested
- [ ] LinkedIn API key verified
- [ ] Clearbit API verified
- [ ] Rate limits understood (LinkedIn: 100 requests/day)

## Assemble Phase

### Build Order

1. Create leads table schema
2. Build LinkedIn scraper tool (`tools/lead_gen/scrape_linkedin.py`)
3. Build Clearbit enrichment tool
4. Implement lead validation workflow

### Component Strategy

- Use existing Python libraries (requests, beautifulsoup4)
- Keep tools single-purpose
- Add error handling for API failures
```

**Why This Works**:

✓ **Follows ATLAS pattern**: Clear A→T→L→A→S structure
✓ **Concrete data schema**: SQL table definition
✓ **Prerequisites check**: Validation checklist
✓ **Build order**: Schema first, then tools
✓ **Anti-patterns documented**: Reference to build_app.md
```

---

## Example 4: Direct Code with Context

**Source**: Implementation with clear reasoning

```markdown
# Implement semantic search with fallback

The current semantic search requires embeddings to exist. Some entries may not have embeddings yet.

## Solution

Add a fallback mechanism that uses BM25 keyword search when embeddings are missing:

```python
def semantic_search(query: str, limit: int = 10):
    # Try vector search first
    results = vector_search(query, limit)

    # If no results or embeddings missing, fallback to BM25
    if not results or needs_embedding(query):
        results = bm25_search(query, limit)

    return results
```

## Why This Works

1. **Graceful degradation**: System still functions without embeddings
2. **Progressive enhancement**: Adds value without breaking existing workflow
3. **Cost awareness**: Avoids unnecessary API calls for re-embedding
4. **Clear logic**: Fallback condition is explicit
5. **Maintains contract**: Returns same format regardless of path
```

---

## Example 5: Honest Limitation Statement

**Source**: Admitting what the system can't do

```markdown
# Email Integration

Current status: The system has no email channel integration.

## What's Missing

- No IMAP/SMTP connections to read emails
- No email sending capabilities
- No Gmail API integration
- No email parsing or extraction tools

## What This Means

You cannot:
- Read emails from your inbox
- Draft or send email responses
- Process email attachments
- Integrate email-based workflows

## Alternative

For now, use OpenClaw's messaging channels (Slack, Discord) for notifications. Email can be added as a future goal.
```

**Why This Works**:

✓ **Direct honesty**: States clearly what's missing
✓ **Explains impact**: Lists specific limitations
✓ **Provides alternative**: Suggests workaround or future path
✓ **No false promises**: Doesn't claim "coming soon" or "will add"
✓ **User-focused**: Addresses what this means for their workflow
```

---

## Example 6: Structured Research Summary

**Source**: Investigation with clear findings

```markdown
# OpenClaw vs GOTCHA Framework: Architecture Comparison

## Key Findings

### Finding 1: State Management
- **Evidence**: OpenClaw uses a Gateway daemon that centralizes all state (sessions, connections, tool execution). GOTCHA assumes distributed state with tool-level management.
- **Implication**: OpenClaw's approach prevents race conditions and enables easier debugging. GOTCHA requires explicit coordination.
- **Confidence**: High

### Finding 2: Tool Policy System
- **Evidence**: OpenClaw has allowlist/denylist plus per-agent profiles. GOTCHA has no policy system; tools can be called freely.
- **Implication**: OpenClaw provides fine-grained security controls. GOTCHA relies on AI judgment without enforcement.
- **Confidence**: High

### Finding 3: Plugin Architecture
- **Evidence**: OpenClaw has a TypeScript plugin SDK with runtime loading. GOTCHA has no plugin system; extensions require core code changes.
- **Implication**: OpenClaw enables community contributions. GOTCHA is monolithic.
- **Confidence**: High

## Recommendations

1. **Adopt Gateway pattern**: Consider centralizing state management in a daemon process.
2. **Implement tool policies**: Add allowlist/denylist for safety controls.
3. **Build plugin SDK**: Enable hot-loading of extensions without core changes.

## Open Questions

- Should the framework maintain distributed tool execution (GOTCHA) or centralize (OpenClaw)?
- What policy model best fits your use case (strict vs flexible)?
```

**Why This Works**:

✓ **Evidence-based**: Each finding has explicit evidence
✓ **Clear implications**: Explains what findings mean
✓ **Confidence ratings**: Honest about certainty
✓ **Actionable recommendations**: Specific next steps
✓ **Questions identified**: What still needs answering
```

---

*Last updated: 2026-02-04*
*Use these examples as quality benchmarks for all output.*
