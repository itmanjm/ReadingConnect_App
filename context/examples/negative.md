# Negative Examples

> Examples of what NOT to do. Anti-patterns to avoid.
> Review these before generating output to prevent mistakes.

---

## Example 1: Vague "We" Language

**Problem**: Indirect language hides responsibility

```markdown
❌ **Bad**:
We should make sure that the database is properly configured before we start the application.

We'll need to test the tool to verify that it works as expected.

We can then proceed with the next steps.
```

```markdown
✅ **Good**:
Configure the database before starting the application.

Test the tool to verify it works as expected.

Proceed with the next steps.
```

**Why Bad**:
- "We" is ambiguous (who is "we"?)
- Passive voice ("should make sure") is weak
- Adds unnecessary words ("before we start")
- No specific actor identified

---

## Example 2: Over-Documenting Simple Tasks

**Problem**: Documentation bloat for trivial actions

```markdown
❌ **Bad**:
# How to add an entry to memory

To add a new entry to memory, follow these steps:

1. First, you'll want to make sure that you have the content that you want to add to memory. This could be a fact about the world, or a preference that you have, or an event that happened that you want to remember.

2. Next, you'll need to decide what type of entry this is. The system supports several types including "fact", "preference", "event", "insight", "task", and "relationship". Choose the one that best matches your content.

3. Then, you can use the memory_write.py tool with the appropriate parameters to add the entry to the database. You'll want to specify the --content flag with your content, the --type flag with your type, and optionally the --importance flag if this is important.

4. After running the command, the entry will be added to both the daily log file and the SQLite database.

5. You can verify that the entry was added successfully by checking the return value of the command or by searching for it using memory_db.py.
```

```markdown
✅ **Good**:
# Add Memory Entry

```bash
python tools/memory/memory_write.py --content "User prefers short meetings" --type preference --importance 7
```
```

**Why Bad**:
- 5 paragraphs to explain a simple command
- Explains the tool instead of using it
- Tutorial tone inappropriate for quick reference
- Wastes reader time looking for actual usage

---

## Example 3: Hedging and Uncertainty

**Problem**: Qualifiers undermine confidence

```markdown
❌ **Bad**:
It might be a good idea to consider adding some additional validation to the tool. However, it seems like the current implementation is probably sufficient for most use cases, so we should probably be careful about making changes that could potentially break existing functionality.

I think that approach A would be more appropriate, but approach B also has some merits that shouldn't be entirely discounted.

```

```markdown
✅ **Good**:
Approach A is preferred. Add validation without breaking existing functionality.

Approach B has merits but introduces complexity. Use only if requirements change.
```

**Why Bad**:
- "It might be" - undermines confidence
- "Probably sufficient" - unnecessary speculation
- "I think that" - weak ownership of assessment
- "Should probably be" - vague recommendation

---

## Example 4: Fluff and Meta-Commentary

**Problem**: Filler words waste reader attention

```markdown
❌ **Bad**:
## Summary

In this section, we're going to take a look at what we've learned from the research into the various aspects of the OpenClaw framework and compare it against our GOTCHA system.

As you can see from the findings above, OpenClaw is a comprehensive system with a lot of sophisticated features that our current implementation doesn't have.

```

```markdown
✅ **Good**:
## Summary

OpenClaw is a comprehensive personal AI assistant with 161K GitHub stars. Compared to GOTCHA, OpenClaw has 10x more workflows, 40+ tools, and a full ecosystem.

Our implementation lacks: multi-channel messaging, skills platform, companion apps, and agent runtime infrastructure.
```

**Why Bad**:
- "we're going to take a look at" - verbose and filler
- "As you can see from the findings above" - meta-commentary about own writing
- "what we've learned" - redundant (section already titled)
- Wastes space stating the obvious

---

## Example 5: No Clear Action Items

**Problem**: Summary without next steps

```markdown
❌ **Bad**:
# Meeting Summary: Q4 Planning

The team discussed the upcoming roadmap and identified several key priorities for the quarter.

## Key Points

- Need to improve API response times
- Should investigate adding more integrations
- Documentation needs updating
- Testing coverage is insufficient
```

```markdown
✅ **Good**:
# Meeting Summary: Q4 Planning

**Action Items**:
- [ ] Add caching layer to reduce API response times by Q2
- [ ] Evaluate Slack and Discord integrations by end of month
- [ ] Update tool documentation with new API examples
- [ ] Add unit tests for critical paths (deadline: March 15)
```

**Why Bad**:
- Summary discusses problems but doesn't provide solutions
- No clear next steps identified
- Passive observation without agency

---

## Example 6: Over-Engineering Solutions

**Problem**: Complex solutions for simple problems

```markdown
❌ **Bad**:
# Enhanced Memory Search System

To improve the search capabilities, we could implement a comprehensive search architecture that combines multiple different approaches together in a unified framework.

## Architecture

The proposed system would utilize a multi-layered search strategy that incorporates vector embeddings, BM25 keyword matching, semantic analysis, and context-aware ranking algorithms. This would be implemented using a microservices architecture with separate services for each search method.

## Implementation Details

### Vector Search Component

We would use the OpenAI embedding API to generate 1536-dimensional vectors for all memory entries. These vectors would be stored in a specialized vector database like Pinecone or Weaviate, which provides optimized nearest neighbor search capabilities.

The vector search service would expose a REST API endpoint that accepts query vectors and returns the top-k most similar entries based on cosine similarity scoring. We would implement batch processing to handle multiple queries efficiently.

### BM25 Component

For keyword-based search, we would implement the BM25 algorithm from scratch using NumPy. This would involve:

1. Tokenizing all memory entries
2. Building inverted index
3. Calculating IDF scores across the corpus
4. Ranking results based on TF-IDF weighted term frequency

This component would be optimized for fast retrieval with proper caching strategies.

### Semantic Analysis Component

To add semantic understanding, we could leverage language models to:

1. Extract entities and relationships from queries
2. Perform query expansion using synonyms
3. Apply domain-specific weighting factors
4. Use sentence embeddings for better matching

This would require additional API calls but significantly improve relevance.

### Unified Orchestration Layer

An orchestration service would combine results from all three search methods using weighted scoring:

```
score = 0.4 * vector_similarity + 0.4 * bm25_score + 0.2 * semantic_analysis
```

We would also implement fallback chains: if vector search fails, try BM25, then try keyword search. This ensures high availability.

### Benefits of This Approach

- Multi-strategy search provides better relevance
- Microservices architecture allows independent scaling
- Caching improves performance
- Fallback chains ensure reliability
- Modular design enables easy maintenance

```

```markdown
✅ **Good**:
# Memory Search Enhancements

## Current Limitations

The hybrid search tool (BM25 + vector) works but has performance issues with large datasets.

## Proposed Enhancement

Add caching layer to reduce repeated embedding generation:

```python
def cached_semantic_search(query: str, limit: int):
    # Check cache first
    if query in cache:
        return cache[query]

    # Generate embedding and search
    results = semantic_search(query, limit)

    # Cache for 24 hours
    cache[query] = (results, time.time())
    return results
```

## Expected Benefit

- 70% reduction in API calls for repeated queries
- Faster response times for common searches
- Lower embedding costs

## Cost Impact

$5/month saved in embedding API costs at current usage levels.
```

**Why Bad**:
- "Comprehensive... framework that combines multiple different approaches" - marketing fluff
- "We would use" - speculative
- "This would involve" - hypothetical
- 150+ lines to explain "add caching" - over-optimization
- "Benefits of This Approach" - sells instead of solves
- No evidence of actual problem or current limitations

---

## Example 7: Ignoring Evidence Requirements

**Problem**: Claims without verification

```markdown
❌ **Bad**:
The system is ready for production deployment. All tools have been tested and are functioning correctly. The architecture follows best practices and should scale well.

We can deploy to staging first to verify everything works in a production-like environment.
```

```markdown
✅ **Good**:
# Deployment Status

**Completed**:
- [x] All tools tested with unit and integration tests
- [x] Database migrations applied
- [x] Configuration validated

**Pending**:
- [ ] Deploy to staging environment
- [ ] Run smoke tests on staging
- [ ] Monitor for 24 hours
- [ ] Deploy to production after sign-off
```

**Why Bad**:
- "Ready for production" without stating what's been done
- No test results or evidence provided
- "Should scale well" - unsupported claim
- No deployment plan or next steps

---

*Last updated: 2026-02-04*
*Review these examples to understand quality standards. Avoid these patterns.*
