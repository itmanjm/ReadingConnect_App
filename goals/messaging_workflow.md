# Messaging Workflow

> Coordinate Telegram gateway with other Atlas workflows (content automation, business automation, fitness, memory).
> This is a goals layer workflow following the ATLAS pattern.

---

## Architect

**Problem**: Need coordination between Telegram messaging gateway and other workflows without tight coupling.

**Success Metrics**:
- Gateway can trigger content automation workflows
- Business automation can send Telegram notifications
- Fitness insights can be delivered via Telegram
- Memory automation can store/retrieve conversations

**Users**: Dre (primary), Andre (tech/operations support)

**Constraints**:
- Gateway must be running for automation triggers
- Integration should be loose coupling (message queue, not direct API calls)
- Respect user preferences for notification frequency

---

## Trace

**Data Schema**:
```sql
-- Message triggers for automation
CREATE TABLE workflow_triggers (
    id INTEGER PRIMARY KEY,
    trigger_type TEXT NOT NULL CHECK(trigger_type IN ('content_automation', 'business_automation', 'fitness_insight', 'memory_reminder')),
    source TEXT NOT NULL,  -- 'youtube_monitoring', 'business_automation', 'fitness_tracking'
    action_payload TEXT,  -- JSON blob for trigger data
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_triggered_at DATETIME,
    trigger_count INTEGER DEFAULT 0
);

-- Workflow executions
CREATE TABLE workflow_executions (
    id INTEGER PRIMARY KEY,
    trigger_id INTEGER NOT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    status TEXT,  -- 'pending', 'running', 'completed', 'failed'
    result TEXT,
    error_message TEXT,
    FOREIGN KEY (trigger_id) REFERENCES workflow_triggers(id)
);
```

**Integration Points**:
- Telegram gateway: Publish to message queue (to be consumed by daemon)
- Content automation: Subscribe to queue for content creation tasks
- Business automation: Subscribe to queue for SkoConnect alerts
- Fitness tracking: Subscribe to queue for workout insights
- Memory automation: Subscribe to queue for date/milestone reminders

---

## Link

### Validation Checklist

- [ ] Telegram daemon can publish to message queue
- [ ] Other workflows can subscribe to message queue
- [ ] Workflow triggers can be created in database
- [ ] Workflow executions can be logged

### Integration Checklist

| Component | Test | Expected Result | Status |
|-----------|------|-----------------|--------|
| Message queue | Create test trigger | Trigger record created | Pending |
| YouTube monitoring | Create content automation trigger | Trigger configured | Pending |
| Business automation | Create business automation trigger | Trigger configured | Pending |
| Fitness tracking | Create fitness insight trigger | Trigger configured | Pending |
| Memory automation | Create memory reminder trigger | Trigger configured | Pending |

---

## Assemble

### Build Order

1. **Message Queue Infrastructure**
   - `tools/messaging/queue.py` - Simple in-memory queue or SQLite-based
   - Publisher interface for Telegram daemon
   - Subscriber interface for other workflows

2. **Trigger Management**
   - `tools/messaging/triggers.py` - CRUD operations for workflow_triggers
   - `tools/messaging/executions.py` - Track workflow executions

3. **Workflow Coordinators**
   - Update `goals/youtube_monitoring.md` to use message queue for new video notifications
   - Update `goals/content_automation.md` to handle automated content creation requests
   - Update `goals/business_automation.md` to send SkoConnect alerts via Telegram
   - Update `goals/fitness_tracking.md` to deliver workout insights

4. **Integration Layer**
   - Modify Telegram daemon to publish to message queue
   - Add subscriber methods to other workflows

### Component Strategy

**Message Queue**: Simple SQLite table for reliability, no Redis complexity
**Triggers**: Database-driven workflow automation
**Coordination**: Loose coupling via message passing, not direct APIs

---

## Stress-Test

### Functionality Testing

**Message Queue**:
- [ ] Create trigger in database
- [ ] Publish message to queue
- [ ] Subscribe to queue (workflow)
- [ ] Consume message from queue
- [ ] Delete message after processing

**Workflow Coordination**:
- [ ] YouTube monitoring triggers on new videos
- [ ] Content automation triggers on new content requests
- [ ] Business automation triggers on SkoConnect events
- [ ] Fitness tracking triggers on workout insights
- [ ] Memory automation triggers on date/milestone events

### Edge Cases

| Edge Case | Test Case | Expected Behavior | Status |
|-----------|-----------|-----------------|--------|
| Queue full | Drop message, alert subscriber | Graceful handling | Pending |
| Subscriber offline | Store in queue, retry | Queue persistence | Pending |
| Workflow fails | Log error, mark failed | Retry mechanism | Pending |
| Invalid trigger | Validation, reject with error | Proper error handling | Pending |

### Performance Testing

- [ ] Create 100 triggers
- [ ] Publish 1000 messages
- [ ] Subscribe 4 workflows simultaneously
- [ ] Process 1000 queued messages
- [ ] Queue operations complete <100ms per operation

---

## Production Considerations

### Before First Run

1. **Message Queue**: SQLite is sufficient for <10K messages/day
2. **Workflow Triggers**: Database migrations needed for production
3. **Integration**: All workflows must handle message queue unavailability gracefully
4. **Logging**: Debug logs for queue operations in production

### Operational Procedures

**Daily Workflow**:
- Monitor message queue size
- Process any stuck messages (retry failed workflows)
- Archive completed executions after 7 days

**Alerting Conditions**:
- Queue size >100 messages → High priority alert
- Failed workflow rate >10% → Investigate
- Subscriber offline >5 min → Queue persistence with retry

---

## Anti-Patterns

From `context/voice.md` and `context/examples/negative.md`:

❌ **Don't**: "We should probably create some kind of a message queue system for all the workflows"
✅ **Do**: "Implement simple SQLite-based message queue with publisher/subscriber pattern. Add workflow triggers database."

❌ **Don't**: "The workflows need to call the Telegram gateway API directly to send messages"
✅ **Do**: "Other workflows publish to message queue. Gateway daemon consumes queue and sends via Telegram. Loose coupling."

❌ **Don't**: "Make sure all the workflows have comprehensive integration testing before production"
✅ **Do**: "Test workflow triggers in isolation first, then integrate. Start with message queue, then add subscribers."

---

## Resources

**Internal:**
- [CLAUDE.md](../CLAUDE.md) - GOTCHA framework
- [.sisyphus/plans/messaging-gateway.md](.sisyphus/plans/messaging-gateway.md) - Master plan
- [args/messaging.yaml](../args/messaging.yaml) - Configuration

**External:**
- [python-telegram-bot docs](https://docs.python-telegram-bot.org/) - Telegram library reference

---

*Last updated: 2026-02-04*
