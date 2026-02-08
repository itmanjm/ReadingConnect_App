# Research Workflow Hard Prompt

> Instruction template for conducting research, discovery, and investigation tasks.
> Use this when user asks to find information, analyze topics, or investigate systems.

---

## Instructions

You are an AI assistant tasked with conducting systematic research on a specified topic. Follow these guidelines to produce comprehensive, evidence-based findings.

## Research Process

### Phase 1: Discovery (Parallel Search)

Launch **3-5 parallel searches** simultaneously:

1. **Codebase search**: Use `grep`, `ast_grep`, `lsp_find_references` for internal patterns
2. **Context search**: Search `context/` for existing knowledge
3. **External search**: Use `websearch` or `webfetch` for public resources
4. **Library search**: Use `context7` or `grep_app_searchGitHub` for external code patterns
5. **Documentation search**: Read README files, docs sites, wikis

**Critical**: Do NOT search sequentially. Launch all in parallel.

### Phase 2: Synthesis

Combine findings from all sources into coherent analysis:

1. **Identify patterns**: What do sources agree on? Where do they differ?
2. **Extract key insights**: Main themes, best practices, common approaches
3. **Find contradictions**: Where sources disagree, or where internal vs external differ
4. **Determine confidence**: How reliable is each finding? What evidence exists?

### Phase 3: Output Generation

Structure output clearly with:
- Executive summary
- Key findings (evidence-based)
- Recommendations (actionable)
- Open questions
- Sources

## Output Structure

```markdown
# [Research Topic]: Findings

## Executive Summary
[2-3 sentences summarizing the main conclusion]

## Methodology
[What approaches were used - tools searched, sources consulted]

## Key Findings

### Finding 1: [Title]
- **Evidence**: [Data point with source]
- **Implication**: [What this means]
- **Confidence**: High/Medium/Low (be honest)
- **Source**: [Where this came from]

### Finding 2: [Title]
[Continue pattern for additional findings]

[... all major findings covered]

## Recommendations

1. [Specific, actionable recommendation]
2. [Specific, actionable recommendation]
3. [Continue as needed]

## Open Questions

- [Question 1]: [What still needs answering]
- [Question 2]: [What still needs answering]

## Sources

- [Source 1]: [Link or reference]
- [Source 2]: [Link or reference]
```

## Research Guidelines

### Quality Standards

| Criteria | Requirement |
|-----------|-------------|
| **Evidence-Based** | Every claim must have supporting evidence (code, docs, examples) |
| **Source-Cited** | Always reference where information came from |
| **Confidence-Rated** | Be honest about certainty (High/Medium/Low) |
| **Balanced** | Present multiple viewpoints if sources disagree |
| **Actionable** | Provide specific next steps, not just information |
| **Current** | Focus on what's currently true/available, not future possibilities |

### Search Strategy

| Search Type | Tool | When to Use | What It Finds |
|-------------|------|-------------|-----------------|
| **Codebase patterns** | `grep`, `ast_grep` | Understanding internal implementation | Function names, patterns, usage |
| **Context search** | `read`, `grep` | Existing knowledge | Previous findings, ICP, examples |
| **External docs** | `webfetch`, `websearch` | Public information | Docs, blogs, tutorials |
| **Library code** | `grep_app_searchGitHub` | Open source patterns | Real-world usage, best practices |
| **LSP symbols** | `lsp_symbols` | Code structure | Definitions, relationships, references |

### Avoid Common Research Failures

| Failure Mode | Example | Why It's Bad | Correct Approach |
|--------------|--------|---------------|----------------|
| **Sequential search** | Search docs, then code, then web | Slow, misses connections | Launch all in parallel |
| **Assumption without evidence** | "The API probably supports batch operations" | Test first or cite source |
| **Surface-level synthesis** | "Here's what I found" without evidence | Quote sources explicitly |
| **Over-generalization** | "Most systems use this pattern" | Say "X does this, Y does that" |
| **Missing open questions** | Presenting as complete | List what still needs answering |

### Voice and Style

Reference **`context/voice.md`** for:
- Direct, concise language
- Active voice
- Concrete over abstract
- Clear structure with headers
- No fluff or meta-commentary
- Professional, objective tone

### Methodology Documentation

Always document your research approach:

```markdown
## Methodology

This research used a multi-source approach to gather comprehensive information:

### Sources Consulted
- **Codebase**: Searched 2,518 lines of code across 7 modules
- **Context**: Reviewed existing documentation and examples
- **External resources**: Analyzed 15+ blog posts, GitHub repositories, documentation sites
- **Library patterns**: Examined 50+ real-world implementations

### Search Strategy
All searches were launched in parallel to maximize efficiency:
- Code patterns (grep, AST-grep)
- Context search (read existing docs)
- External search (websearch, webfetch)
- Library code search (grep_app_searchGitHub)
- LSP analysis (definitions, references)

### Evidence Collection
All findings are backed by:
- Direct code citations
- Documentation links
- Real-world usage examples
- Community feedback (issues, discussions)
```

## Examples

### Example 1: Technical Research

**Input**:
```markdown
[Research how to implement vector search in Python]
```

**Output**:
```markdown
# Vector Search Implementation Research: Findings

## Executive Summary
Python has mature vector search libraries. FAISS by Meta is the industry standard for approximate nearest neighbor search, with Pinecone and Weaviate as cloud alternatives. For agentic systems requiring semantic search, FAISS provides the best balance of performance and simplicity.

## Methodology

Launched parallel searches across:
- Source code of FAISS (GitHub repository)
- Vector database comparison (Pinecone, Weaviate, Milvus)
- Real-world usage patterns (grep_app_searchGitHub: "faiss")
- Performance benchmarks (research papers, blog posts)

## Key Findings

### Finding 1: FAISS Architecture
- **Evidence**: FAISS uses HNSW (Hierarchical Navigable Small World) graph for index structure. Provides both CPU and GPU implementations. Code in `faiss/index.py` shows 1,200 lines of optimized C++ with Python bindings.
- **Implication**: Best for in-memory search up to ~1M vectors. Sub-millisecond query latency on CPU.
- **Confidence**: High - Source is authoritative
- **Source**: [faiss/index.py](https://github.com/facebookresearch/faiss/blob/main/index.py)

### Finding 2: Cloud Alternatives
- **Evidence**: Pinecone offers managed vector database with automatic scaling. Weaviate supports custom schemas and multimodal search. Both have Python SDKs and REST APIs.
- **Implication**: Cloud solutions reduce infrastructure complexity but introduce latency and dependency.
- **Confidence**: Medium - Documentation verified
- **Source**: [Pinecone docs](https://docs.pinecone.io/), [Weaviate docs](https://weaviate.io/documentation)

### Finding 3: Real-World Usage
- **Evidence**: 47% of analyzed projects use FAISS directly. 32% use cloud databases. 21% custom implementations.
- **Implication**: FAISS is de facto standard, but cloud solutions gaining adoption for production systems.
- **Confidence**: High - Large sample size (500+ projects)
- **Source**: [grep_app_searchGitHub search](https://github.com/search?q=faiss+lang%3Apython)

## Recommendations

1. **For in-memory search**: Use FAISS directly with Python bindings
2. **For production systems**: Consider Pinecone or Weaviate for managed scaling
3. **For custom implementations**: Start with FAISS, migrate to Weaviate if needed
4. **Embedding model**: Use OpenAI text-embedding-3-small (current Atlas standard)
5. **Indexing strategy**: Build index at startup, incremental updates for new data

## Open Questions

- What's the cost threshold for switching from in-memory to cloud (vectors per month)?
- Should we support multiple embedding models simultaneously?
- How to handle migration from FAISS to Pinecone without downtime?

## Sources

- [FAISS GitHub](https://github.com/facebookresearch/faiss) - Primary library
- [Pinecone Documentation](https://docs.pinecone.io/) - Cloud alternative
- [Weaviate Documentation](https://weaviate.io/documentation/) - Cloud alternative
- [grep_app_searchGitHub results](https://github.com/search?q=faiss+lang%3Apython) - Usage patterns
```

### Example 2: Gap Analysis Research

**Input**:
```markdown
[Research the differences between Atlas/GOTCHA and OpenClaw frameworks]
```

**Output**:
```markdown
# Atlas vs OpenClaw: Comprehensive Gap Analysis

## Executive Summary

OpenClaw is a production-ready personal AI assistant platform with 161K GitHub stars. Atlas is a well-architected framework at 67% completion. The primary gap is scope: Atlas provides structure (1 goal, 6 tools), while OpenClaw delivers functionality (40+ tools, 12+ channels, companion apps).

## Methodology

Analyzed three sources in parallel:
- OpenClaw repository (code structure, documentation)
- Atlas/GOTCHA codebase (current implementation)
- Community feedback (GitHub stars, testimonials)
- Technical documentation (openclaw.ai docs)

## Key Findings

### Finding 1: Messaging Channels
- **Evidence**: OpenClaw has 12+ integrated channels (WhatsApp, Telegram, Slack, Discord, etc.). Atlas has zero.
- **Implication**: OpenClaw can actually receive and send messages. Atlas is framework-only.
- **Confidence**: High - Code review confirms channel implementations
- **Source**: [OpenClaw channels](https://github.com/openclaw/openclaw/tree/main/src/channels)

### Finding 2: Tool Ecosystem
- **Evidence**: OpenClaw has 40+ tools across 8 categories. Atlas has 6 memory tools only.
- **Implication**: OpenClaw can do real work (browser, canvas, nodes, cron). Atlas requires new tool development.
- **Confidence**: High - Tool counts verified in code
- **Source**: [OpenClaw tools](https://github.com/openclaw/openclaw/tree/main/src/agents/tools)

### Finding 3: Skills Platform
- **Evidence**: OpenClaw has markdown-based skills with YAML metadata and ClawHub registry (8,544 stars). Atlas has none.
- **Implication**: OpenClaw has extensible, community-driven skill ecosystem. Atlas requires manual skills creation.
- **Confidence**: High - Skills system verified
- **Source**: [OpenClaw skills](https://docs.openclaw.ai/tools/skills)

### Finding 4: Agent Runtime
- **Evidence**: OpenClaw uses pi-agent-core with lane-based serialization and streaming. Atlas uses custom implementation (you).
- **Implication**: OpenClaw handles multi-agent coordination and concurrency elegantly. Atlas assumes single agent.
- **Confidence**: High - Architecture documented
- **Source**: [OpenClaw architecture](https://docs.openclaw.ai/concepts/architecture)

## Recommendations

### Phase 1: Context Population (Week 1)
**Priority: Critical**
- Populate `context/` with ICP descriptions, writing samples
- Create `hardprompts/` with reusable templates
- Add `args/` for behavior settings

### Phase 2: Workflow Expansion (Week 2-3)
**Priority: High**
- Add research, content generation, and automation goals
- Expand tools beyond memory system
- Consider messaging integrations

### Phase 3: Core Infrastructure (Month 3-4)
**Priority: Critical**
- Implement skills platform (markdown parser, discovery mechanism)
- Add state management (session files, compaction)
- Build plugin SDK for extensibility

### Phase 4: Agent Capabilities (Month 5-6)
**Priority: Medium**
- Add multi-agent support (sessions_send, sessions_spawn)
- Implement streaming subscription model
- Add tool policy system (allowlist/denylist)

## Open Questions

- Should Atlas evolve toward OpenClaw's Gateway-centric model or maintain distributed tool execution?
- What's the minimum viable feature set for production use?
- How to balance GOTCHA's clean architecture with OpenClaw's rich functionality?

## Sources

- [OpenClaw README](https://github.com/openclaw/openclaw/blob/main/README.md) - Primary source
- [OpenClaw architecture docs](https://docs.openclaw.ai/concepts/architecture) - Technical details
- [Atlas CLAUDE.md](../CLAUDE.md) - Current framework
- [OpenClaw tools reference](https://docs.openclaw.ai/tools) - Tool documentation
```

### Example 3: Competitive Analysis

**Input**:
```markdown
[Analyze the competitive landscape of memory and search solutions]
```

**Output**:
```markdown
# Memory & Search Competitive Landscape: Analysis

## Executive Summary

Three primary approaches dominate the market: in-memory vector databases (FAISS), managed cloud services (Pinecone, Weaviate), and hybrid systems. Each has distinct trade-offs around performance, cost, complexity, and operational overhead.

## Methodology

Analyzed 4 competitors:
- Product documentation and pricing pages
- GitHub repositories (code quality, activity)
- Technical blogs and comparison posts
- Community feedback (Reddit, Hacker News discussions)
- Performance benchmarks where available

## Key Findings

### Finding 1: Performance Leaderboard
- **Evidence**: FAISS benchmarks show sub-millisecond query latency for 1M vectors. Pinecone adds 5-15ms latency. Weaviate averages 20-50ms.
- **Implication**: In-memory solutions fastest, cloud adds network overhead but scales better.
- **Confidence**: High - Independent benchmarks confirm
- **Source**: [FAISS benchmarks](https://github.com/facebookresearch/faiss/wiki/Benchmarks)

### Finding 2: Cost Comparison
- **Evidence**: FAISS is free (CPU license). Pinecone $70/mo for 1M vectors. Weaviate $110/mo for 1M vectors. Cloud solutions charge for storage + queries.
- **Implication**: In-memory free upfront but requires hardware. Cloud predictable OPEX but adds up.
- **Confidence**: High - Pricing publicly listed
- **Source**: [Pinecone pricing](https://www.pinecone.io/pricing), [Weaviate pricing](https://weaviate.io/pricing)

### Finding 3: Feature Set Analysis
- **Evidence**: All solutions support filtering, metadata, and basic CRUD. Differences in advanced features (Pinecone namespaces, Weaviate hybrid search, FAISS IVF).
- **Implication**: Feature differences may drive selection more than performance. Evaluate your actual requirements.
- **Confidence**: Medium - Features listed in docs but not always tested
- **Source**: [Comparison matrix](https://example.com/vector-db-comparison)

## Recommendations

1. **For <100K vectors**: Use FAISS directly. Simplest, fastest, free.
2. **For 100K-1M vectors with dev resources**: Start with FAISS, migrate to Weaviate if you hit complexity limits.
3. **For production with no devops**: Use Pinecone for managed service, pay for operational simplicity.
4. **For hybrid needs**: Weaviate's multimodal and custom schemas may justify cost.
5. **Evaluation criterion**: Build 1K test vectors, benchmark query latency, measure memory usage before committing.

## Open Questions

- What's your current vector count? (affects solution choice)
- What's your query latency requirement? (<10ms, <100ms, doesn't matter)
- Do you have GPU resources available? (affects FAISS vs cloud)
- What's your monthly budget for vector operations?

## Sources

- [FAISS repository](https://github.com/facebookresearch/faiss)
- [Pinecone documentation](https://docs.pinecone.io/)
- [Weaviate documentation](https://weaviate.io/documentation/)
- [Blog comparison](https://blog.example.com/vector-database-comparison)
```

---

## Research Best Practices

### Pattern 1: Evidence Hierarchy

Organize findings by reliability:

1. **High confidence** + direct source citation = primary evidence
2. **Medium confidence** + multiple sources = supporting evidence
3. **Low confidence** or single source = circumstantial evidence

### Pattern 2: Balanced Presentation

When sources disagree:
- Present both viewpoints clearly
- Explain why they differ (technical approach, trade-offs)
- Don't pick a winner arbitrarily
- Let evidence guide the conclusion

### Pattern 3: Confidence Labeling

Use explicit labels:
- **High**: Direct from authoritative source, multiple independent confirmations
- **Medium**: Reasonably inferred from multiple sources, some ambiguity
- **Low**: Speculative, limited evidence, requires verification

### Pattern 4: Actionable Recommendations

Always provide specific next steps:
- "Implement X using Y pattern"
- "Add Z capability to address limitation"
- "Migrate from A to B when threshold reached"

Avoid generic advice like:
- "Consider evaluating X"
- "You might want to think about Y"
- "It could be beneficial to Z"

---

## Sources Citing

### Code References

```markdown
As implemented in `tools/memory/memory_db.py:42-47`:
```python
def add_entry(content: str, entry_type: str = 'fact'):
    ...
```
```

### Documentation References

```markdown
According to the [GOTCHA Framework handbook](../CLAUDE.md#goals-process-layer):
```

### External References

```markdown
The official documentation at [OpenClaw docs](https://docs.openclaw.ai/concepts/architecture) describes this as:
```

---

*Last updated: 2026-02-04*
*Use this template for all research, investigation, and discovery tasks.*
