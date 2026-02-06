# Memory Automation

> Automate recall of dates, milestones, and relationships using memory system + scheduled triggers.
> Focus: Reduce cognitive load, never miss important dates, maintain relationships intentionally.

---

## Architect

**Problem**: Dre forgets key dates (birthdays, anniversaries), struggles with relational upkeep. Manual tracking requires mental bandwidth Andre doesn't have.

**Success Metrics**:
- 0 missed dates (birthdays, anniversaries, parents, best friend)
- Weekly relationship check-ins (automated prompts)
- Reduced cognitive load (no mental date tracking)
- Intentional relationship investment

**Users**: Dre (primary), Kerry (wife), shared access

**Constraints**:
- Privacy-first (personal relationship details not exposed)
- Respects Dre's introversion (proactive, not nagging)
- Uses existing memory system (no new infrastructure)

---

## Trace

**Existing Memory Schema** (from tools/memory/memory_db.py):
```sql
memory_entries (id, content, type, source, importance, created_at)
daily_logs (date, summary, raw_log, key_events)
```

**Date Types to Track**:
- Family birthdays (Dre, Kerry, Kal-El, Mackenzie, parents, sister, best friend)
- Anniversary (Dre + Kerry: Jan 28)
- Important dates (Yvette: April 12, Noel: Feb 16)
- Milestones (firsts, achievements, transitions)

**Relationship Check-ins**:
- Weekly questions about marriage
- Monthly family health
- Quarterly relationship goals review

---

## Link

**Tools to Use**:
1. `tools/memory/memory_write.py` - Store dates as 'event' type
2. `tools/memory/memory_db.py` - Search by date/person
3. Existing memory system (no new code needed)

**Scheduling Mechanism**:
- Use cron jobs (when automation tool exists)
- Or integrate with daily workflow (manual check-ins)

---

## Assemble

**Workflow Design**:
1. **Date Loading** (daily)
   - Check memory for next 7 days of events
   - Flag upcoming dates (within 3 days = alert)

2. **Reminder Generation** (when date approaching)
   - Create reminder entry 3 days before event
   - Format: "X days until [event] - [action items]"

3. **Check-in Triggers** (weekly/monthly)
   - Generate relationship check-in prompts
   - Store as 'task' type in memory

4. **Review Workflow** (quarterly)
   - Retrieve all relationship/milestone entries
   - Analyze patterns (missed dates, proactive check-ins)
   - Generate insights

---

## Stress-Test

**Test Scenarios**:
- [ ] Store 5 upcoming dates correctly
- [ ] Generate reminder 3 days before event
- [ ] Weekly check-in prompt created automatically
- [ ] Quarterly review identifies patterns

**Go-Live Checklist**:
- [ ] Dre approves reminder cadence (3 days? 7 days?)
- [ ] No duplicate entries
- [ ] Privacy respected (personal details stored securely)

---

## Production Considerations

**Privacy Rules**:
- Never auto-send reminders without Dre's approval
- Store only what Dre explicitly shares
- Relationship details are personal, not shared externally

**Escalation**:
- If date is missed → ask permission to add post-event reflection
- If Dre wants to stop → disable immediately via args/priority

---

*Last updated: 2026-02-04*
