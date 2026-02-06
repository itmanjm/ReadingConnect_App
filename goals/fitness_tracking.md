# Fitness Tracking

> Monitor fitness journeys and workout channels (WORKOUT, Fitness Tutorial) for personalized insights.
> Focus: Track effective training methods, identify routines that work, suggest improvements.

---

## Architect

**Problem**: Andre's fitness goals exist but no tracking system. Workout channels publish content without personalized connection to his journey.

**Success Metrics**:
- Weekly workout summaries (time spent, exercises done)
- Progress tracking across channels
- Personalized recommendations based on what works
- Identify plateau periods early

**Users**: Andre (primary), potential: Kerry (shared journey tracking)

**Constraints**:
- No API access to these channels (public YouTube content)
- Must respect content creators' work (summarize, don't scrape)
- Privacy-first (store only what user wants tracked)

---

## Trace

**Monitored Channels**:
1. **WORKOUT** (YouTube: @workoutbody)
   - Focus: Professional athletes, coaches
   - Type: Advanced programs, biomechanics

2. **Fitness Tutorial** (YouTube: @fitnesstutorial)
   - Focus: Efficient home/gym workouts
   - Type: Exercise tutorials, modifications

**Data Schema**:
```sql
CREATE TABLE fitness_progress (
    id INTEGER PRIMARY KEY,
    channel_id TEXT NOT NULL,
    video_id TEXT NOT NULL,
    title TEXT NOT NULL,
    workout_type TEXT,  -- 'strength', 'cardio', 'flexibility', 'mobility'
    exercises TEXT,  -- JSON array of exercise names
    duration_seconds INTEGER,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    effectiveness INTEGER DEFAULT 0,  -- 1-5 rating
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Link

**Integration Points**:
- [ ] YouTube API for video metadata (public info only)
- [ ] Memory system to track preferences, goals
- [ ] Args integration (fitness goals from args/workflow-themes.yaml)

---

## Assemble

**Tools to Build**:
1. `tools/fitness/fetch_workouts.py` - Get recent videos from channels
2. `tools/fitness/extract_exercises.py` - Parse exercise details
3. `tools/fitness/analyze_effectiveness.py` - Identify patterns
4. `tools/fitness/suggest_routines.py` - Recommend based on progress

**Build Order**:
1. Fetch → extract → analyze
2. Store in memory (tools/memory/)
3. Weekly analysis → recommendations

---

## Stress-Test

**Test Scenarios**:
- [ ] Track 10 workouts from each channel
- [ ] Identify 3 effective routines
- [ ] Generate 2 personalized recommendations

**Go-Live Checklist**:
- [ ] Weekly summaries readable and useful
- [ ] No duplicate tracking across channels
- [ ] Memory integration working

---

*Last updated: 2026-02-04*
