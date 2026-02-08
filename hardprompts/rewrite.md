# Rewrite Workflow Hard Prompt

> Instruction template for rewriting content in a specific voice or style.
> Use this when user asks to rewrite content to match a tone, style, or audience.

---

## Instructions

You are an AI assistant tasked with rewriting provided content to match specific guidelines. Follow these instructions carefully:

## Analysis Phase

Before rewriting, analyze the source:

1. **Identify the goal**: What is this rewrite trying to achieve?
2. **Understand the source**: What is the current voice, style, and structure?
3. **Identify gaps**: What needs to be changed?
4. **Determine requirements**: Any constraints, word counts, formatting needs?

## Rewrite Guidelines

### Voice and Tone

- **Match the requested voice**: Direct, professional, friendly, casual, etc.
- **Be consistent**: Don't shift voices mid-rewrite
- **Use active voice**: "Change this" not "This should be changed"
- **Remove hedging**: No "perhaps", "might", "could"

### Structure

- **Preserve meaning**: Don't change what the content says, only how it's said
- **Improve clarity**: Make ambiguous parts more specific
- **Enhance flow**: Better transitions between ideas
- **Simplify complexity**: Break down convoluted sentences

### Style

Reference **`context/voice.md`** for:
- No fluff or filler words
- Concrete over abstract language
- Clear headers and formatting
- Active verbs
- No meta-commentary

### Common Rewrite Types

| Type | Description | Voice Characteristics |
|-------|-------------|---------------------|
| **Simplify** | Make complex text clearer and shorter | Direct, plain language |
| **Professionalize** | Add business/corporate tone | Formal, precise, objective |
| **Casualize** | Make formal text conversational | Friendly, accessible, warm |
| **Formalize** | Add academic or official tone | Structured, references, cautious |
| **Concise** | Reduce word count while preserving meaning | Efficient, essential |
| **Expand** | Add more detail and examples | Explanatory, comprehensive |

## Output Structure

```markdown
# [Title of Rewritten Content]

[If applicable: Original context or source]

[Rewritten content following the specified guidelines]
```

## Process Checklist

- [ ] Analyzed source content for meaning
- [ ] Identified required changes (voice, style, structure)
- [ ] Applied rewrite guidelines from `context/voice.md`
- [ ] Verified meaning was preserved (not changed, only improved)
- [ ] Checked for new ambiguities introduced
- [ ] Ensured tone consistency throughout

## Quality Checks

### After Rewriting, Verify:

- [ ] Is the voice correct? (Direct vs Professional vs Casual)
- [ ] Is the style consistent? (No fluff, concrete language)
- [ ] Is the structure clear? (Good headers, logical flow)
- [ ] Is the meaning preserved? (Nothing fundamentally changed)
- [ ] Are there new ambiguities? (None introduced)

### If Issues Found:

**Identify the problem**: [What went wrong?]
**How to fix**: [Corrective action]
**Should redo?**: [Yes/No - if rewrite needs revision]

## Voice and Style

Reference **`context/voice.md`** for all guidelines:
- Direct, no fluff
- Active voice
- Concrete over abstract
- Clear structure

## Examples

### Example 1: Simplify

**Source**:
```markdown
In order to facilitate the process of adding new entries to the memory system, it would be advisable to first make sure that you have a good understanding of the content that you want to add, and then you should decide what type of entry this is. The system supports several types including "fact", "preference", "event", "insight", "task", and "relationship". You should choose the one that best matches your content.
```

**Rewrite Goal**: Make it clearer and more direct

**Rewrite**:
```markdown
Add memory entries by selecting the appropriate type (fact, preference, event, insight, task, or relationship).
```

**Why Better**:
- Reduced from 52 words to 16 words
- Removed filler phrases ("it would be advisable", "in order to", "a good understanding")
- More direct action
- Preserved meaning completely

---

### Example 2: Professionalize

**Source**:
```markdown
Hey! I was thinking we could maybe look at adding some caching to the search tools to improve performance. What do you think about that?
```

**Rewrite Goal**: Make it professional and business-appropriate

**Rewrite**:
```markdown
Performance optimization: Consider adding a caching layer to improve search response times.
```

**Why Better**:
- Removed informal greeting and filler
- More specific title
- Professional, objective tone
- Clear business focus

---

### Example 3: Casualize

**Source**:
```markdown
The memory database implements a CRUD interface with full support for adding, updating, and retrieving entries. It includes support for content deduplication using SHA-256 hashing to prevent duplicate entries.
```

**Rewrite Goal**: Make it conversational and accessible

**Rewrite**:
```markdown
The memory database handles adding, updating, and retrieving entries. It prevents duplicates using SHA-256 hashing.
```

**Why Better**:
- More conversational ("handles" vs "implements")
- Simpler language
- Removed technical detail that wasn't necessary
- More approachable

---

### Example 4: Formalize for Documentation

**Source**:
```markdown
If you're looking for information on how to configure the various aspects of the system, you can refer to the CLAUDE.md file, which serves as a comprehensive handbook that covers all the essential operational details.
```

**Rewrite Goal**: Make it structured and reference-appropriate

**Rewrite**:
```markdown
Configuration reference: See [CLAUDE.md](../CLAUDE.md) for comprehensive system operational details.
```

**Why Better**:
- More authoritative tone
- Proper link formatting
- Clear categorization
- Reference-focused structure

---

### Example 5: Expand with Examples

**Source**:
```markdown
The search functionality works by comparing the query against stored embeddings using cosine similarity. It returns the top results ranked by similarity score.
```

**Rewrite Goal**: Add more context and examples

**Rewrite**:
```markdown
The search functionality uses cosine similarity to compare query embeddings against stored vectors. It returns ranked results, with higher scores indicating greater semantic similarity.

For example:
- Query: "What tools are available?"
- Top result: "memory_search.py" (similarity: 0.92)
- Second result: "semantic_search.py" (similarity: 0.87)

Use the `--limit` parameter to control the number of results returned (default: 10).
```

**Why Better**:
- More explanatory
- Added concrete example
- Better understanding of how it works
- Still concise overall

---

### Example 6: Fix Ambiguity

**Source**:
```markdown
We should probably implement some kind of a fallback mechanism for when the API is unavailable. That way the system can still function even if there are issues.
```

**Rewrite Goal**: Make it specific and actionable

**Rewrite**:
```markdown
Implement a fallback mechanism to handle API unavailability gracefully. Try alternative providers or cached data before failing completely.
```

**Why Better**:
- Removed "probably" and "some kind of"
- More specific about the solution
- Clear action item
- No uncertainty

---

## Common Patterns

### Pattern: Removing Passive Voice

**Bad**: "It is recommended that..."
**Good**: "Configure [specific file]..."

### Pattern: Cutting Fluff

**Bad**: "In order to do that, we need to first..."
**Good**: "To [action], [specific requirement]..."

### Pattern: Making Specific

**Bad**: "Make sure that the configuration is set up properly..."
**Good**: "Verify [specific configuration] before starting..."

### Pattern: Active Voice

**Bad**: "This should probably be considered..."
**Good**: "Consider [approach]..."

---

*Last updated: 2026-02-04*
*Use this template for all rewrite tasks.*
