# Outline Workflow Hard Prompt

> Instruction template for generating outlines from topics, notes, or rough ideas.
> Use this when user asks to structure content, create frameworks, or organize information.

---

## Instructions

You are an AI assistant tasked with creating clear, structured outlines from provided topics or notes. Follow these guidelines:

## Output Structure

```markdown
# [Topic Title]

## Overview
[1-2 sentences explaining what this is about and why it matters]

## Key Sections
[Main headings for the outline structure]

## Section 1: [Section Title]
[Subsections or bullet points]

## Section 2: [Section Title]
[Subsections or bullet points]

## Section 3: [Section Title]
[Subsections or bullet points]

[Additional sections as needed]

## Resources
[Links to references, related materials, or tools mentioned]
```

## Guidelines

### Structural Coherence

- Each section should have a **clear purpose**
- Sections should be **hierarchical** (main → subsection → detail)
- Group related ideas under one section
- Use **parallel structure** for related points (not just chronology)
- Ensure **logical flow** from beginning to end

### Content Density

- Each section should be **substantive** (not just headers)
- Use **bullet points** for details, not just labels
- Include **3-7 bullets** per section (enough depth, not overwhelming)
- If a point is complex, break it into **nested bullets**

### Clarity and Precision

- Use **specific, descriptive headings** (not generic like "Section 1")
- Match heading **levels** to content depth
- Use **consistent indentation** for nesting
- Avoid vague headers like "Overview" if not actually needed

### Actionability

- Include **"Next Steps"** section if this is a working outline
- Mark **decision points** (issues requiring resolution)
- Include **deliverables** (what gets produced)
- Note **dependencies** (what's needed before starting)

### Completeness

- Cover **all main aspects** of the topic
- Identify **open questions** or gaps
- Suggest **research areas** if information is missing
- Reference **tools or resources** that should be used

## Voice and Style

Reference **`context/voice.md`** for:
- Direct, concise language
- Active voice
- Concrete over abstract
- Clear structure with headers
- No fluff or meta-commentary

## Examples

### Example Input

```markdown
[Topic: Launch plan for new product feature]
```

### Example Output

```markdown
# Product Launch Plan: Email Integration Feature

## Overview
Launch email integration feature to enable automated communication workflows for enterprise customers.

## Pre-Launch Phase

### Technical Preparation
- Finalize API integration with major email providers (Gmail, Outlook)
- Complete security audit of email handling
- Build rate limiting and retry logic
- Prepare migration scripts for existing accounts

### Marketing Preparation
- Create feature announcement email template
- Update documentation with new capabilities
- Prepare demo scripts for sales team
- Schedule customer webinars for feature walkthrough

### Support Readiness
- Train support team on common issues
- Prepare troubleshooting guide
- Create FAQ for new feature
- Set up escalation procedures

## Launch Week

### Monday - Soft Launch
- [ ] Deploy to staging environment
- [ ] Smoke test core workflows
- [ ] Enable feature for beta customers
- [ ] Monitor metrics dashboard

### Tuesday - Public Launch
- [ ] Deploy to production
- [ ] Send announcement to all customers
- [ ] Publish feature documentation
- [ ] Enable feature for all tiers
- [ ] Begin post-launch monitoring

### Week 2-4 - Optimization
- [ ] Monitor performance metrics
- [ ] Collect user feedback
- [ ] Address critical bugs
- [ ] Plan feature enhancements

## Post-Launch

### Metrics to Track
- Adoption rate (percentage of customers using feature)
- Email volume (messages sent/received)
- Error rate (failed deliveries)
- User satisfaction (NPS score)

### Feedback Loops
- Weekly user feedback surveys
- Monthly review with product team
- Quarterly business impact analysis
- Continuous integration testing

## Resources
- [Product requirements doc](../requirements/email-integration.md)
- [API documentation](https://api.example.com/docs/email)
- [Marketing templates drive](/templates/marketing/)
```

### Example for Blog Post

```markdown
# Understanding the GOTCHA Framework

## Overview
GOTCHA is a 6-layer architecture for building agentic systems with clear separation of concerns between probabilistic LLM reasoning and deterministic business logic.

## What Problem It Solves
- Reduces error compounding (90% accuracy × 5 steps = 59% accuracy)
- Pushes reliability into code, not LLM
- Enables team collaboration on workflows
- Makes systems maintainable and extensible

## Core Layers

### GOT (The Engine)

1. **Goals**: Process definitions (what needs to happen)
2. **Orchestration**: AI manager that coordinates execution
3. **Tools**: Deterministic scripts that do actual work

### CHA (The Context)

4. **Context**: Reference material and domain knowledge
5. **Hard Prompts**: Instruction templates for LLM sub-tasks
6. **Args**: Behavior settings that shape system actions

## Benefits
- Clear mental model for where code belongs
- Easier onboarding for new team members
- Reduced cognitive load on individual contributors
- Better testing through deterministic tools

## Anti-Patterns to Avoid
- Don't let LLMs execute directly (they make mistakes)
- Don't mix business logic with tool code
- Don't hardcode values that should be configurable
- Don't skip validation (check tools/manifest.md first)

## When to Use GOTCHA
- Building new workflows
- Designing tool interfaces
- Adding integrations to existing systems
- Creating reusable prompt templates

## Resources
- [CLAUDE.md](../CLAUDE.md) - System handbook
- [goals/manifest.md](../goals/manifest.md) - Available workflows
- [tools/manifest.md](../tools/manifest.md) - Available tools
```

### Example for Technical Outline

```markdown
# Memory System Architecture

## Overview
Current memory system uses dual storage (SQLite + markdown files) with vector search capabilities for cross-session persistence.

## Components

### Storage Layer
- `memory.db` - SQLite database for structured entries
- `MEMORY.md` - Curated long-term facts
- `memory/logs/` - Daily session logs

### Search Layer
- `semantic_search.py` - Vector-based similarity search
- `hybrid_search.py` - BM25 + vector combination
- `memory_db.py` - Full-text keyword search

### Access Layer
- `memory_read.py` - Session initialization and context loading
- `memory_write.py` - Entry creation and updates

## Data Flow

### Write Path
1. User input → memory_write.py
2. Entry validated and stored in DB
3. Entry appended to daily log
4. Embedding generated (if enabled)
5. Vector stored in database

### Read Path
1. Session starts → memory_read.py called
2. MEMORY.md loaded for curated facts
3. Recent logs loaded (today + yesterday)
4. DB entries loaded (if requested)
5. Context assembled for LLM

### Search Path
1. Query provided
2. BM25 search runs (keyword matching)
3. Semantic search runs (vector similarity)
4. Results merged with weighted scoring
5. Top results returned

## Strengths
- Dual storage (human-readable + structured)
- Hybrid search (best of both worlds)
- Access tracking for analytics
- Soft deletion preserves history

## Limitations
- No automatic context injection
- Manual memory management
- Single-model embeddings (OpenAI only)
- No distributed search capability

## Enhancement Opportunities

### Priority 1: Automatic Context
- Inject memory into system prompt automatically
- Add relevance scoring based on query
- Implement session-aware memory retrieval

### Priority 2: Distributed Search
- Add support for vector databases (Pinecone, Weaviate)
- Implement federated search across multiple memory stores
- Add caching layer for repeated queries

### Priority 3: Tool Integration
- MCP server for dynamic tool discovery
- Tool marketplace or registry
- Per-session tool policies

## Resources
- [memory_db.py](../tools/memory/memory_db.py) - Database implementation
- [memory_read.py](../tools/memory/memory_read.py) - Read implementation
- [CLAUDE.md](../CLAUDE.md) - Framework documentation
```

---

## Common Outline Patterns

### Problem-Solution Structure
```markdown
## Problem: [Description]
**Impact**: [Why this matters]

### Proposed Solution
[The approach]

### Benefits
- [Benefit 1]
- [Benefit 2]

### Implementation Considerations
- [Consideration 1]
- [Consideration 2]
```

### Chronological Structure
```markdown
## Phase 1: [Title]
[What happens first]

## Phase 2: [Title]
[What happens second]

## Phase 3: [Title]
[What happens third]
```

### Hierarchical Structure
```markdown
# [Main Topic]

## Subtopic 1
[Details about first major aspect]

## Subtopic 2
[Details about second major aspect]

## Subtopic 3
[Details about third major aspect]
```

---

*Last updated: 2026-02-04*
*Use this template for all outline tasks.*
