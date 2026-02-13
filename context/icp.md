# Ideal Customer Profile (ICP)

> This file describes the ideal user/customer profile for this agentic system.
> The AI reads this to understand who we're building for and align output accordingly.

---

## User Identity

**Name**: [To be defined]
**Role**: [To be defined]
**Context**: [Developer / Creator / Founder / Individual / Team]

---

## Core Values

| Value | Description |
|--------|-------------|
| **Speed over perfection** | Prioritize getting things done over making them perfect |
| **Action over deliberation** | Move fast, learn from execution, iterate |
| **Reliability over novelty** | Use proven approaches over experimental ones |
| **Clarity over cleverness** | Be direct and explicit, not clever or ambiguous |
| **Delivery over process** | Focus on outcomes, not methodology |
| **Results over features** | Ship what works, not what could work |

---

## Communication Style

**Tone**: Direct, concise, no fluff
**Format**: Clear structure with headers, bullet points, code blocks
**Pacing**: Start immediately, no acknowledgments ("I'm on it", "Let me start")
**Updates**: Report progress through todos, not status messages

---

## Work Style

**Approach**:
- Single-focus execution (one task at a time)
- Verification after completion (tests, manual checks)
- Evidence requirements (diagnostics, build status, test runs)
- Never leave code in broken state

**Quality Standards**:
- No type suppression (`as any`, `@ts-ignore`)
- Follow existing code patterns (if disciplined codebase)
- Propose approach before ambiguous decisions
- Ask clarifying questions when scope unclear

**Anti-Patterns**:
- No shotgun debugging (random changes)
- No deleting failing tests
- No committing without explicit request
- No speculation without evidence

---

## Technical Preferences

| Category | Preference |
|----------|-------------|
| **Languages** | TypeScript/JavaScript/Python preferred for web tools, Rust/Go for systems |
| **Frameworks** | Modern, well-maintained over bleeding-edge |
| **Databases** | SQLite for local, Firebase/Cloud Firestore for cloud |
| **Deployment** | Simple, reliable, automated pipelines |
| **Documentation** | Code comments + README, not over-documentation |
| **Testing** | Critical path, end-to-end for user-facing, unit for libraries |

---

## What Success Looks Like

**Definition**: "It works reliably and the user is happy with the outcome."

**Examples**:
- Tool executes without errors and produces expected output format
- Goal workflow completes without blockers
- Build passes, tests pass, deploy succeeds
- User confirms the result meets their needs
- No follow-up questions needed

**What Success Is Not**:
- Code compiles but isn't tested
- Tool runs but output format is wrong
- Goal documented but not implemented
- Framework described but not operational

---

## Constraints & Non-Negotiables

### Non-Negotiable (Must Follow)

- **GOTCHA Framework**: Never violate the 6-layer separation of concerns
- **Tools First**: Always check tools/manifest.md before creating new scripts
- **Evidence-Based**: All claims require verification (diagnostics, test runs, build output)
- **Type Safety**: Never suppress type errors with `as any`, `@ts-ignore`
- **Direct Communication**: Be concise, start work immediately, no fluff

### Flexible (Can Adapt)

- Code style: Match existing patterns (if disciplined) or follow modern best practices
- File structure: Align with project conventions
- Testing: Adapt based on project maturity (tests exist? CI/CD?)

---

## Anti-Patterns (What We Don't Do)

| Pattern | Why It's Bad | What We Do Instead |
|---------|---------------|-------------------|
| **Vibe Coding** | Builds without design → rewrites required | Follow ATLAS: Architect → Trace → Link → Assemble → Stress-test |
| **Premature Abstraction** | Layers before understanding needs | Simple first, abstract when pattern repeats 3+ times |
| **Over-Engineering** | Complex solutions for simple problems | Minimal viable product, iterate |
| **Shotgun Debugging** | Random changes hoping something works | One change, verify, fix root cause |
| **Test-Driven Development** | Tests without requirements | Write to meet needs, add tests when behavior stabilizes |
| **Feature Factory** | Adding features because "we might need it" | Only build when requested |

---

## Context Triggers

**When I should reference this**:
- Creating new goals/workflows
- Designing tool interfaces
- Making architectural decisions
- Setting behavior policies (args)
- Choosing between implementation approaches

**Questions I should ask**:
- "What problem does this solve?" (Architect phase)
- "Who is this for?" (Architect phase)
- "What does success look like?" (Architect phase)
- "Should I follow X pattern or Y pattern?" (when codebase has mixed conventions)
- "Do you want me to implement X, or just design it?"

---

*Last updated: 2026-02-04*
*This file is the source of truth for user/customer alignment. Edit directly to update.*
