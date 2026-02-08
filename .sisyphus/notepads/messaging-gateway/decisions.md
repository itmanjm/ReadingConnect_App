# Decisions: Messaging Gateway Implementation

> Architectural choices and rationales for the messaging gateway.

---

## [2026-02-04] Tech Stack Selection

### Runtime: Python 3.8+
**Rationale**:
- Mature async ecosystem (asyncio, aiohttp)
- python-telegram-bot official library support
- Excellent SQLite integration
- Widely used in production

### Database: SQLite
**Rationale**:
- Already using for memory system
- No additional infrastructure required
- Sufficient for message queue/sessions
- Easy backup/transport

### API Library: python-telegram-bot
**Rationale**:
- Official Telegram bot wrapper
- Async support
- Active maintenance
- Comprehensive documentation

### Configuration: YAML
**Rationale**:
- Human-readable format
- Existing args system uses YAML
- Supports environment variable substitution
- Easy version control

---

## [2026-02-04] Rate Limiting Strategy

### Algorithm: Token Bucket
**Parameters**:
- Rate: 20 requests per minute
- Burst: 5 requests
- Refill: 0.333 tokens/second

**Rationale**:
- Standard for API rate limiting
- Allows burst traffic
- Smooth refilling over time
- Matches Telegram API limits

**Alternative Considered**: Fixed window (rejected - not smooth enough)

---

## [2026-02-04] Polling vs Webhooks

### Decision: Long-Polling (not Webhooks)
**Rationale**:
- Webhooks require HTTPS server
- Long-polling works without external infrastructure
- Simpler to deploy and test
- Sufficient for personal use case

**Trade-off**: Slight latency increase vs webhooks

**Future Consideration**: Add webhook mode for production scaling

---

## [2026-02-04] Session Management

### Session Creation: get_or_create Pattern
**Rationale**:
- Atomic operation (no race conditions)
- Automatic session tracking
- Updates message_count and last_message_at
- Simplifies caller code

**Alternative**: Separate get/create calls (rejected - more complex)

---

## [2026-02-04] Memory Integration Strategy

### Approach: Hook-based Integration
**Decision**: Daemon provides hooks, actual memory operations in separate class

**Rationale**:
- Daemon focuses on Telegram API
- Memory integration can be enhanced independently
- Easier to test memory operations separately
- Follows separation of concerns

**Status**: Hook framework implemented, full integration pending

---

## [2026-02-04] Error Handling Strategy

### Philosophy: Daemon Never Crashes
**Approach**:
- Catch all exceptions at handler level
- Log errors with context
- Return error message to user when possible
- Continue processing other requests

**Rationale**:
- Long-running daemon must be resilient
- Single message error shouldn't stop service
- Users see clear error messages
- Logs available for debugging

---

## [2026-02-04] Logging Strategy

### Destination: File + Stdout
**Rationale**:
- File: Persistent logs for debugging
- Stdout: Real-time monitoring during development
- Configurable log levels (debug, info, warn, error)
- Structured format: timestamp, level, component, message

**Default Location**: `/tmp/messaging-gateway.log`

---

## [2026-02-04] Command Set Selection

### Implemented Commands
- `/start` - Welcome message
- `/help` - Help information
- `/sessions` - List active sessions
- `/stats` - Session statistics

**Rationale**:
- Essential for bot discovery
- Useful for debugging
- Demonstrates session management
- Easy to extend

**Not Implemented Yet**:
- Message commands (e.g., "remind me", "search memory")
- Workflow triggers (deferred to Phase 5)
- Interactive buttons (callback queries - stub implemented)

---

## [2026-02-04] Test Automation Strategy

### Approach: Multi-Level Testing
**Levels**:
1. **Static Analysis** - Code inspection (classes, methods, patterns)
2. **Database Testing** - Direct database operations
3. **Runtime Testing** - Requires running bot (blocked until user action)

**Rationale**: Can verify most functionality without live bot, catch issues early

### Test Runner Design
**Decision**: Single test runner script with scenario methods

**Structure**:
```python
python3 test_runner.py --all                    # Run all scenarios
python3 test_runner.py --scenario 3              # Run specific scenario
python3 test_runner.py --all --verbose          # Verbose output
python3 test_runner.py --all --json              # JSON for CI/CD
```

**Benefits**:
- Flexible: Run all or specific scenarios
- Debugging: Verbose mode available
- Automation: JSON output for integration
- Progress: Clear status per scenario

### Migration Strategy
**Decision**: Separate pure SQL file from documented version

**Files**:
- `database.py` - Documented version with comments/markdown
- `migrations.sql` - Pure SQL for sqlite3 command

**Rationale**: sqlite3 can't parse markdown headers, need clean SQL

### Test Status Categorization
**Four-Level Status System**:
1. **pass** - Full verification, all tests pass
2. **partial** - Code/framework verified, runtime testing blocked
3. **blocked** - Requires external resources (bot token, multiple users)
4. **fail** - Implementation missing or broken

**Rationale**: Clear distinction between "ready" and "needs external resources"

---

## [2026-02-04] Memory Database Schema Resolution

### Decision: Database Schema Alignment

**Problem**: memory_entries table missing columns that tools expect

**Missing Columns**:
- source (expected by tools for entry tracking)
- is_active (expected by tools for filtering)
- embedding (expected by tools for vector storage)
- expires_at (expected by tools for temporary data)
- tags (expected by tools for categorization)
- context (expected by tools for related entries)
- session_id (expected by tools for conversation linking)

**Solution Applied**:
1. Created migration file: `tools/memory/migrate_v2.sql`
2. Applied migration: `sqlite3 data/memory.db < tools/memory/migrate_v2.sql`
3. Verified all columns now present (11 total)
4. Verified memory tools import successfully

**Rationale**:
- Minimal impact to existing data
- Maintains compatibility with all memory tools
- Uses ALTER TABLE statements to avoid data loss
- Adds proper indexes for performance

**Status**: ✅ Schema aligned, all memory goals unblocked

---

## [2026-02-04] Memory Database Schema Resolution

### Decision: Database Schema Alignment

**Problem**: memory_entries table missing columns that tools expect

**Missing Columns**:
- source (expected by tools for entry tracking)
- is_active (expected by tools for filtering)
- embedding (expected by tools for vector storage)
- expires_at (expected by tools for temporary data)
- tags (expected by tools for categorization)
- context (expected by tools for related entries)
- session_id (expected by tools for conversation linking)

**Solution Applied**:
1. Created migration file: `tools/memory/migrate_v2.sql`
2. Applied migration: `sqlite3 data/memory.db < tools/memory/migrate_v2.sql`
3. Verified all columns now present (11 total)
4. Verified memory tools import successfully

**Rationale**:
- Minimal impact to existing data
- Maintains compatibility with all memory tools
- Uses ALTER TABLE statements to avoid data loss
- Adds proper indexes for performance

**Status**: ✅ Schema aligned, all memory goals unblocked
