# YouTube Monitoring and Content Tracking

> Monitor 23 YouTube channels across 10 categories for business strategy, AI developments, fitness, marriage insights, and content trends.

---

## A — ARCHITECT

### Problem Statement

User (Andre Newsome) has 23 YouTube channels to monitor manually:
- Business Strategy & YouTube Growth (3 channels - Jack Roberts ecosystem)
- AI & Startup Strategy (3 channels)
- AI Tools & Coding (3 channels)
- Software Engineering (1 channel)
- Business AI Automation (2 channels)
- Marriage & Relationships (2 channels)
- Fitness & Personal Development (2 channels)
- IT Professional Growth (2 channels)
- YouTube as Business Asset (5+ channels mixed)

**Challenges:**
- Manual tracking is time-consuming (30+ minutes/day)
- Misses key insights without systematic review
- No centralized view of trends across categories
- Hard to identify opportunities when they appear
- Cognitive overload from scattered information

**User Constraints:**
- Solo operator (no team)
- Cost-conscious operations
- Safety-first approach (no live pushes without review)
- Values systems thinking over magic
- Wants actionable insights, not just information

### Users & Stakeholders

**Primary User:** Andre Newsome
- Senior IT Infrastructure/Operations Leader
- Founder: SkoConnect (EdTech SaaS, ~85% complete)
- Solo operator, responsible for all decisions

**Secondary Stakeholders:**
- SkoConnect team (business strategy alignment)
- Kerry (wife - marriage insights)
- Kal-El and Mackenzie (family content awareness)

### Success Metrics

**Outcome Measures:**
- [ ] 100% of channels monitored automatically (vs manual)
- [ ] Daily insights summary generated (≤5 minutes to read)
- [ ] Weekly trends analysis (growth patterns, content themes)
- [ ] Relevant content flagged within 24 hours of publication
- [ ] Business opportunities identified from AI/tool channels

**Quality Metrics:**
- [ ] False positive rate <5% (don't alert on irrelevant content)
- [ ] Insights capture ≥80% of key topics (not missing important themes)
- [ ] Trend detection accuracy (actual vs predicted growth)
- [ ] Content summarization quality (useful vs noise)

### Constraints

**Technical Constraints:**
- YouTube API quotas (free tier limits)
- Rate limiting to avoid API blocks
- No real-time streaming (batch processing acceptable)
- Must work with existing memory system (tools/memory/)
- Must integrate with args/ model-choices.yaml

**Time Constraints:**
- Daily monitoring: <15 minutes total
- Weekly analysis: <30 minutes total
- Monthly deep-dive: <1 hour

**Cost Constraints:**
- Stay within free YouTube API tier if possible
- Minimal API calls (batch where possible)
- Leverage existing tools (no new subscriptions)

---

## T — TRACE

### Data Schema

```sql
-- YouTube monitoring database
CREATE TABLE youtube_channels (
    id INTEGER PRIMARY KEY,
    channel_id TEXT UNIQUE NOT NULL,
    url TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    subscriber_count INTEGER DEFAULT 0,
    video_count INTEGER DEFAULT 0,
    last_checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_video_at DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT
);

-- Video tracking
CREATE TABLE youtube_videos (
    id INTEGER PRIMARY KEY,
    channel_id INTEGER NOT NULL,
    video_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    published_at DATETIME NOT NULL,
    views INTEGER DEFAULT 0,
    duration_seconds INTEGER,
    transcript TEXT,
    summary TEXT,
    key_insights TEXT,
    is_watched BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (channel_id) REFERENCES youtube_channels(id)
);

-- Insights tracking
CREATE TABLE youtube_insights (
    id INTEGER PRIMARY KEY,
    channel_id INTEGER NOT NULL,
    video_id INTEGER,
    insight_type TEXT NOT NULL,  -- 'business_strategy', 'ai_tool', 'fitness', 'marriage'
    content TEXT NOT NULL,
    confidence REAL DEFAULT 1.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (channel_id) REFERENCES youtube_channels(id),
    FOREIGN KEY (video_id) REFERENCES youtube_videos(id)
);
```

### Integration Map

| Service | Purpose | API Type | Status | Cost |
|---------|---------|----------|--------|------|
| YouTube Data API v3 | Channel metadata, video list | REST | Free tier (quota-limited) |
| YouTube Transcript API | Video transcripts (if available) | REST | Paid tier |
| OpenAI API | Summary generation (gpt-4o-mini) | REST | Uses existing key |
| Memory System | Store insights, flag for review | SQLite (existing) | Free |

### Tech Stack

**Backend:**
- Python 3.10+
- SQLite (existing memory.db)
- requests library (YouTube API)
- OpenAI Python SDK (summaries)

**Data Processing:**
- Batch API calls (minimize quota usage)
- Async processing for speed
- Memory integration (tools/memory/memory_write.py)

**Configuration:**
- args/model-choices.yaml for model selection
- args/workflow-themes.yaml for monitoring priority
- YouTube channel list stored in context/ (new file: context/youtube_channels.yaml)

---

## L — LINK

### Connection Validation

- [ ] YouTube API key available in .env
- [ ] OpenAI API key available in .env
- [ ] Memory system accessible (tools/memory/)
- [ ] Context file structure ready (context/youtube_channels.yaml)

### Validation Checklist

| Component | Test | Expected Result | Status |
|-----------|------|-----------------|--------|
| YouTube API Connection | `curl -i "https://www.googleapis.com/youtube/v3/channels?part=snippet&key=$API_KEY"` | HTTP 200, JSON response | Pending |
| Memory Write | `python tools/memory/memory_write.py --content "test"` | Success status | Pending |
| Context File Read | `cat context/youtube_channels.yaml` | Valid YAML | Pending |
| Summary Generation | `python -c "import openai; openai.chat.completions.create(...)"` | Summary text | Pending |

### Rate Limit Understanding

YouTube Data API v3 (free tier):
- 10,000 quota units/day
- Channel details: 1 unit
- Video list: 1 unit/video (max 50 per request)
- **Strategy**: Batch channel checks, use video list sparingly

---

## A — ASSEMBLE

### Build Order

1. **Setup infrastructure**
   - Create context/youtube_channels.yaml with 23 channels
   - Create tools/youtube/ directory
   - Add API keys to .env

2. **Build core tools**
   - `tools/youtube/fetch_channels.py` - Get channel metadata
   - `tools/youtube/fetch_videos.py` - Get recent videos
   - `tools/youtube/generate_summary.py` - Summarize with OpenAI
   - `tools/youtube/extract_insights.py` - Identify business/fitness/marriage insights

3. **Build monitoring workflow**
   - `tools/youtube/daily_check.py` - Automated daily monitoring
   - `tools/youtube/weekly_analysis.py` - Trend analysis
   - `tools/youtube/insights_to_memory.py` - Store insights in memory system

4. **Integration layer**
   - Memory system integration (store summaries, flag important content)
   - Args integration (model selection, monitoring frequency)
   - Context layer integration (channel metadata in context/youtube_channels.yaml)

### Component Strategy

**Modular Design:**
- Each tool is single-purpose (fetch, summarize, analyze)
- Workflow tools orchestrate individual tools
- Memory system stores persistent insights

**Error Handling:**
- YouTube API quota exceeded → wait and retry
- Transcript not available → fallback to title + description
- OpenAI API failure → retry with backup model
- Network errors → exponential backoff

**Observability:**
- Log all API calls with timestamps and quota usage
- Track success/failure rates per channel
- Monitor insight quality (false positives, missed insights)

---

## S — STRESS-TEST

### Functionality Testing

**Core Features:**
- [ ] Fetch channel metadata for all 23 channels
- [ ] Retrieve latest 5 videos per channel
- [ ] Generate summaries using OpenAI (gpt-4o-mini for cost)
- [ ] Extract insights based on channel category (business, AI, fitness, marriage)
- [ ] Store insights in memory system with appropriate type

**Integration Testing:**
- [ ] Memory write operations succeed (tools/memory/memory_write.py)
- [ ] Args configuration loaded (model-choices.yaml)
- [ ] Context file parsed correctly (youtube_channels.yaml)
- [ ] Workflow executes end-to-end without manual intervention

### Edge Cases

| Edge Case | Test Case | Expected Behavior | Status |
|-----------|-----------|-----------------|--------|
| Channel deleted | Monitor non-existent channel | Log warning, skip channel | Pending |
| No new videos | Empty video list | Report "no updates", don't fail | Pending |
| Transcript unavailable | Video without transcript | Use title + description for summary | Pending |
| API quota exceeded | Hit daily limit | Queue for next day, don't crash | Pending |
| Rate limit hit | Too many requests | Wait with backoff, retry | Pending |
| Duplicate video | Same video ID seen before | Update existing record, don't duplicate | Pending |

### Performance Testing

**Performance Metrics:**
- [ ] Full monitoring cycle <15 minutes (23 channels)
- [ ] Daily insights summary generated <5 minutes
- [ ] Weekly analysis <30 minutes
- [ ] Memory write operations <1 second

**Stress Testing:**
- [ ] Monitor for 7 consecutive days without errors
- [ ] Test with all 23 channels active
- [ ] Test with API quota exhaustion scenarios
- [ ] Test memory system with 1000+ entries

---

## Production Considerations

### Before First Run

1. **YouTube API Quotas**: Understand free tier limits and upgrade timing
2. **Cost Analysis**: Estimate OpenAI API costs for summaries (gpt-4o-mini is cost-effective)
3. **Privacy Check**: Public YouTube content requires no special handling, but transcripts may have restrictions
4. **Memory System**: Ensure memory.db can handle 1000+ insights/month

### Operational Procedures

**Daily Workflow:**
- Run `tools/youtube/daily_check.py` (scheduled or manual)
- Review daily insights summary
- Flag high-priority content for manual review

**Weekly Workflow:**
- Run `tools/youtube/weekly_analysis.py`
- Review trends across categories
- Update SkoConnect business strategy if insights warrant

**Monthly Workflow:**
- Review channel list (add/remove channels)
- Analyze growth patterns
- Update monitoring priorities (args/workflow-themes.yaml)

### Monitoring & Alerts

**Health Checks:**
- YouTube API connectivity (daily)
- Memory system integrity (weekly)
- Insight generation success rate (weekly)

**Alerting Conditions:**
- API failure rate >5% → investigate
- Memory write failures >3 in a row → investigate
- False positive rate >5% → adjust insight thresholds

---

## Anti-Patterns

From `context/voice.md` and `context/examples/negative.md`:

❌ **Don't**: "We should probably think about adding some kind of a monitoring system"
✅ **Do**: "Implement automated monitoring with daily, weekly, and monthly workflows"

❌ **Don't**: "The YouTube API has quotas that we need to be careful about"
✅ **Do**: "YouTube Data API v3 free tier: 10,000 quota units/day. Batch requests to maximize coverage."

❌ **Don't**: Over-document setup steps
✅ **Do**: "Create context/youtube_channels.yaml with 23 channel URLs. Add YouTube and OpenAI API keys to .env."

❌ **Don't**: Make assumptions about what's valuable without evidence
✅ **Do**: "Extract insights based on channel category (business strategy, AI tools, fitness, marriage) using keyword matching and semantic analysis."

---

## Resources

**Internal:**
- [CLAUDE.md](../CLAUDE.md) - GOTCHA framework
- [tools/memory/](../tools/memory/) - Memory system tools
- [hardprompts/summarize.md](../hardprompts/summarize.md) - Summary workflow
- [args/model-choices.yaml](../args/model-choices.yaml) - Model configuration
- [context/youtube_channels.yaml](../context/youtube_channels.yaml) - Channel metadata (to be created)

**External:**
- [YouTube Data API v3 Documentation](https://developers.google.com/youtube/v3)
- [YouTube API Quotas](https://developers.google.com/youtube/v3/determine_quota_cost)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference/chat)

---

*Last updated: 2026-02-04*
