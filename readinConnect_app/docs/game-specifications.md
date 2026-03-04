# ReadingConnect Game Specifications
## Detailed Technical & Pedagogical Documentation

---

## Game 1: WORD BUILDER 🏗️
### CVC Word Construction Game

### **Learning Objective**
Enable students to encode (spell) CVC words, reinforcing the connection between phonemes and graphemes through active construction rather than passive recognition.

### **Research Foundation**
- **Ehri's Phases of Word Learning (2005):** Full alphabetic phase requires connection between all phonemes and graphemes
- **Research Finding:** Encoding (spelling) improves decoding (reading) more than decoding practice alone (Boscardin et al., 2008)
- **Systematic Phonics:** CVC words follow predictable patterns, making them ideal for early readers

### **Gameplay Flow**
```
1. Display picture (cat) + audio "What word is this?"
2. Show 3 empty slots: _ _ _
3. Display 6 letter tiles: [c] [a] [t] [b] [m] [p]
4. Student drags letters to slots
5. Immediate feedback:
   - Correct slot: Green glow + click sound
   - Wrong slot: Red shake + gentle "Try another letter"
6. Upon completion: Word spoken aloud + celebration
7. Progress to next word
```

### **UI Components**
- **Picture Display:** 300x300px centered image
- **Letter Slots:** 80x80px drop zones with dashed borders
- **Letter Tiles:** 70x70px draggable, rounded corners, large font (48px)
- **Progress Bar:** Visual tracker at top
- **Sound Button:** Speaker icon to hear target word again
- **Hint System:** After 2 wrong attempts, highlight first letter

### **Data Model**
```typescript
interface CVCWord {
  id: string;
  word: string;           // "cat"
  phonemes: string[];     // ["c", "a", "t"]
  image: string;          // URL to image
  audio: string;          // URL to pronunciation
  distractors: string[];  // ["b", "m", "p"] - wrong letters to show
  difficulty: 1 | 2 | 3;  // 1=easy (sat, cat), 2=med (hen, fox), 3=hard (quiz, box)
}

interface WordBuilderState {
  currentWord: CVCWord;
  placedLetters: (string | null)[];
  attempts: number;
  score: number;
  streak: number;
}
```

### **Scoring Algorithm**
- Base points: 10 per correct word
- Speed bonus: +5 if completed < 10 seconds
- Streak bonus: +2 per consecutive correct (max +10)
- Hint penalty: -3 if hint used
- Perfect round (no hints): +20 bonus

### **Progression Logic**
```
Level 1: Short 'a' family (-at, -an, -ap) - 20 words
Level 2: Short 'i' family (-it, -in, -ig) - 20 words
Level 3: Short 'o' family (-ot, -op, -og) - 20 words
Level 4: Short 'e' family (-en, -et, -ed) - 20 words
Level 5: Short 'u' family (-ug, -un, -ut) - 20 words
Level 6+: Mixed review + consonant blends
```

### **Accessibility**
- Large touch targets (70px minimum)
- High contrast colors
- Audio support for all instructions
- No time pressure (optional timer for challenge mode)
- Dyslexia-friendly font option

### **Teacher Dashboard Integration**
- Track: Words attempted, accuracy %, hint usage
- Flag: Students struggling with specific vowel sounds
- Export: List of mastered vs. struggling words

---

## Game 2: STORY SEQUENCING 🧩
### Narrative Structure Comprehension

### **Learning Objective**
Develop understanding of story structure (beginning, middle, end) and causal relationships between events to improve reading comprehension and retelling skills.

### **Research Foundation**
- **Story Grammar Theory (Stein & Glenn, 1979):** Understanding narrative structure improves recall and comprehension
- **Research Finding:** Explicit instruction in story structure improves comprehension by 30% (Morrow, 1985)
- **Retelling Assessment:** Strong predictor of reading comprehension (Morrow, 1988)

### **Gameplay Flow**
```
1. Show 3-4 scrambled story scene cards
2. Audio: "Put these pictures in order to tell the story"
3. Student drags cards to numbered positions (1, 2, 3)
4. Real-time validation: Green check when correct
5. Upon completion: Play full story animation
6. Optional: "Tell the story in your own words" recording
7. Progress to next story
```

### **Story Card Structure**
```typescript
interface StoryScene {
  id: string;
  image: string;          // Illustration
  caption: string;        // Simple sentence
  audio: string;          // Narration
  sequence: number;       // 1, 2, or 3
}

interface StorySet {
  id: string;
  title: string;
  scenes: StoryScene[];
  theme: 'daily_routine' | 'problem_solving' | 'cause_effect' | 'seasonal';
  difficulty: 1 | 2 | 3;  // 1=3 scenes, 2=4 scenes, 3=complex causal
  vocabulary: string[];   // Target words
}
```

### **Sample Stories**

**Level 1 (3 scenes):**
- Scene 1: Boy plants seed
- Scene 2: Seed grows into sprout
- Scene 3: Big sunflower blooms

**Level 2 (4 scenes):**
- Scene 1: Cat wants fish on counter
- Scene 2: Cat pushes chair to counter
- Scene 3: Cat climbs up
- Scene 4: Cat gets fish + dog sees

**Level 3 (Causal chains):**
- Scenes showing complex cause-effect relationships

### **UI Components**
- **Scene Cards:** 200x250px with large illustrations
- **Drop Zones:** Numbered positions (1st, 2nd, 3rd)
- **Story Strip:** Bottom area to build sequence
- **Play Button:** Hear the full story once ordered
- **Retry Button:** Reset and try again

### **Scoring & Feedback**
- 100 points for perfect sequence
- 50 points for 2/3 correct (encouragement)
- Hints available: "What usually happens first?"
- Celebration: Full story animation with narration

### **Pedagogical Scaffolds**
1. **Visual cues:** Arrow showing time flow
2. **Temporal language:** "First, next, last" labels
3. **Causal connectors:** Story themes focus on cause-effect
4. **Gradual release:** 3 scenes → 4 scenes → 5 scenes

---

## Game 3: READING RACETRACK 🏎️
### Repeated Reading Fluency Builder

### **Learning Objective**
Improve reading fluency through repeated reading of the same text, building automaticity, accuracy, and prosody.

### **Research Foundation**
- **Samuels (1979):** Repeated reading produces 40-50% fluency gains
- **National Reading Panel (2000):** Fluency is bridge between decoding and comprehension
- **Research Finding:** 3-4 readings of same text optimal (Therrien, 2004)

### **Gameplay Flow**
```
ROUND 1:
1. Display decodable passage (20-40 words)
2. Student reads aloud (or taps words to hear)
3. System tracks reading time
4. Calculate WPM (words per minute)
5. Show car position on track (slow)

ROUND 2:
6. "Read it again to beat your time!"
7. Track improvement: WPM + accuracy
8. Car moves faster on track

ROUND 3:
9. Final reading attempt
10. Show best time, accuracy %
11. Award medals: Bronze/Silver/Gold
12. Save to progress chart
```

### **Passage Specifications**
```typescript
interface FluencyPassage {
  id: string;
  title: string;
  text: string;              // 20-60 words
  wordCount: number;
  level: 1 | 2 | 3 | 4;      // Corresponds to phonics phases
  targetWPM: {               // Age-appropriate goals
    slow: number;            // 20 WPM (beginner)
    medium: number;          // 40 WPM (developing)
    fast: number;            // 60 WPM (fluent)
  };
  focusPhonics: string[];    // Target patterns
  comprehensionQuestions: Question[];
}

// Example Level 1 Passage:
{
  title: "The Big Cat",
  text: "The big cat sat on the mat. The cat is fat. The fat cat sat.",
  wordCount: 19,
  level: 1,
  targetWPM: { slow: 15, medium: 25, fast: 40 },
  focusPhonics: ["short_a", "CVC"]
}
```

### **Passage Library Structure**
- **Level 1:** CVC words only, 15-25 words, repetitive pattern
- **Level 2:** CVC + simple sight words, 25-35 words
- **Level 3:** Blends + digraphs, 35-50 words
- **Level 4:** Multi-syllabic, 50-75 words

**Total passages needed:** 40-50 (10 per level)

### **UI Components**
- **Passage Display:** Large font (24px), line-by-line highlighting
- **Racetrack:** Visual track with car avatar
- **Timer:** Optional visible countdown
- **Word Tapping:** Tap any word to hear it
- **Progress Chart:** Shows WPM improvement over attempts

### **WPM Calculation**
```javascript
function calculateWPM(wordCount, seconds) {
  const minutes = seconds / 60;
  return Math.round(wordCount / minutes);
}

// Accuracy calculation
function calculateAccuracy(correctWords, totalWords) {
  return Math.round((correctWords / totalWords) * 100);
}
```

### **Medal System**
- **Bronze:** Complete all 3 readings
- **Silver:** Improve WPM by 20%+ from Round 1 to 3
- **Gold:** Achieve target WPM with 95%+ accuracy

### **Speech Recognition (Future Enhancement)**
- Optional: Use Web Speech API for automatic WPM tracking
- Fallback: Self-paced with tap-to-confirm words

### **Teacher Insights**
- Track: WPM growth over time, accuracy trends
- Identify: Students who need fluency intervention
- Compare: Class averages, percentile rankings
- Export: Individual fluency progress reports

---

## Game 4: SOUND DETECTIVE 🔍
### Phoneme Isolation Activity

### **Learning Objective**
Develop phonemic awareness by identifying individual sounds (phonemes) at the beginning, middle, and end of words.

### **Research Foundation**
- **National Reading Panel (2000):** Phonemic awareness is strongest predictor of reading success
- **Adams (1990):** Phoneme isolation is prerequisite skill for phonics
- **Research Finding:** 10-15 hours of PA instruction produces significant gains (Bus & van Ijzendoorn, 1999)

### **Gameplay Flow**
```
1. Robot character appears with speech bubble
2. Robot says: "Listen to this word: C-A-T" (slowly segmented)
3. Question: "What sound do you hear at the BEGINNING?"
4. Show 3 phoneme cards: [c] [a] [t]
5. Child clicks answer
6. Immediate feedback:
   - Correct: "Yes! /c/ is the first sound in cat!"
   - Incorrect: "Listen again... C-A-T" (replay)
7. Progress through positions: Beginning → End → Middle
```

### **Position Progression**
```
Level 1-5: Beginning sounds (easiest)
Level 6-10: Ending sounds
Level 11-15: Middle sounds (hardest)
Level 16+: Mixed positions
```

### **Word Selection Criteria**
- Use continuous sounds first (/m/, /s/, /f/) - easier to hear
- Avoid stop sounds (/b/, /d/, /g/) initially
- Clear, distinct phonemes (avoid: sky, box - consonant clusters)
- High-frequency words

### **Visual Design**
- **Robot Character:** Friendly, animated speech
- **Sound Waves:** Visual animation when word spoken
- **Phoneme Cards:** Large letters with mouth formation images
- **Progress:** Case file folder filling with solved sounds

### **Data Tracking**
```typescript
interface PhonemeAssessment {
  studentId: string;
  position: 'beginning' | 'middle' | 'end';
  phoneme: string;
  correct: boolean;
  responseTime: number;
  attempts: number;
}
```

### **Mastery Criteria**
- 80% accuracy for 3 consecutive sessions = mastery
- Auto-advance to next position when mastered
- Review cycle: Revisit mastered sounds weekly

---

## Game 5: QUESTION QUEST ❓
### Reading Comprehension Strategy Game

### **Learning Objective**
Develop comprehension monitoring and question-answering strategies across literal, inferential, and evaluative levels.

### **Research Foundation**
- **QAR Strategy (Raphael, 1986):** Explicit instruction in question types improves comprehension
- **Research Finding:** Self-questioning strategies improve comprehension by 25% (Rosenshine, 1997)
- **Assessment:** Question answering is most common comprehension measure

### **Question Types (QAR Framework)**

**1. Right There (Literal)**
- Answer explicitly stated in text
- Example: "What color was the dog?" → "The dog was brown."

**2. Think & Search (Inferential)**
- Answer requires connecting information
- Example: "Why was the boy sad?" → Must infer from events

**3. Author & Me (Evaluative)**
- Answer requires text + background knowledge
- Example: "Was the boy's decision good? Why?"

**4. On My Own (Personal)**
- Answer based on personal experience
- Example: "Have you ever felt like the character?"

### **Gameplay Flow**
```
1. Display short passage (2-4 sentences)
2. Read aloud (or student reads)
3. Present question with 3 picture choices
4. Child selects answer
5. Immediate feedback:
   - Correct: Gem collection + explanation
   - Incorrect: "Let's look back at the story..."
6. Progress through question types
7. Earn badges for question type mastery
```

### **Passage Specifications**
```typescript
interface ComprehensionPassage {
  id: string;
  text: string;              // 2-4 simple sentences
  image?: string;            // Optional illustration
  audio: string;             // Narration
  level: 1 | 2 | 3;
  questions: Question[];
  vocabulary: string[];      // Pre-taught words
}

interface Question {
  id: string;
  text: string;              // Question text
  type: 'right_there' | 'think_search' | 'author_me';
  choices: {
    text: string;
    image: string;
    correct: boolean;
  }[];
  explanation: string;       // Why answer is correct
  hint: string;              // Scaffold for wrong answers
}
```

### **Sample Passage & Questions**

**Passage:**
"Sam has a red ball. He throws the ball to his dog. The dog catches it. Sam is happy."

**Questions:**
1. Right There: "What color is Sam's ball?"
   - Choices: [red ball pic], [blue ball pic], [green ball pic]

2. Think & Search: "How does Sam feel at the end?"
   - Choices: [sad face], [happy face], [angry face]
   - Requires connecting "Sam is happy" to question

3. Author & Me: "Is playing with a dog fun?"
   - Choices: [thumbs up], [thumbs down], [question mark]
   - Personal + text connection

### **Scaffolding Features**
- **Text Highlighting:** Relevant sentence highlights when hint used
- **Reread Button:** Hear passage again
- **Picture Support:** All answers have images
- **Explanation:** Learn WHY answer is correct

### **Progression**
```
Level 1: Right There only (80% accuracy to advance)
Level 2: Right There + Think & Search
Level 3: All three types mixed
Level 4+: Longer passages, complex questions
```

---

## Game 6: WORD POP 🎈
### Rapid Sight Word Recognition

### **Learning Objective**
Build automatic recognition of high-frequency sight words to improve reading fluency.

### **Research Foundation**
- **Ehri (2005):** Sight words stored as unified whole in memory
- **Research Finding:** Automatic recognition requires 20+ exposures (Adams, 1990)
- **Fluency Connection:** Sight word knowledge is strong predictor of reading fluency

### **Gameplay Flow**
```
1. Target word announced: "Pop the word 'the'!"
2. Balloons float up from bottom of screen
3. Each balloon contains a word
4. Child taps all balloons with "the"
5. Multiple target balloons appear simultaneously
6. Speed increases as level progresses
7. 3 strikes (wrong taps) = game over
8. Score based on speed + accuracy
```

### **Sight Word Lists (Dolch Organized)**
```typescript
const SIGHT_WORD_LEVELS = {
  preprimer: ['a', 'and', 'away', 'big', 'blue', 'can', 'come', 'down', 'find', 'for', 'funny', 'go', 'help', 'here', 'I', 'in', 'is', 'it', 'jump', 'little', 'look', 'make', 'me', 'my', 'not', 'one', 'play', 'red', 'run', 'said', 'see', 'three', 'to', 'two', 'up', 'we', 'where', 'yellow', 'you'],
  primer: ['all', 'am', 'are', 'at', 'ate', 'be', 'black', 'brown', 'but', 'came', 'did', 'do', 'eat', 'four', 'get', 'good', 'have', 'he', 'into', 'like', 'must', 'new', 'no', 'now', 'on', 'our', 'out', 'please', 'pretty', 'ran', 'ride', 'saw', 'say', 'she', 'so', 'soon', 'that', 'there', 'they', 'this', 'too', 'under', 'want', 'was', 'well', 'went', 'what', 'white', 'who', 'will', 'with', 'yes'],
  grade1: ['after', 'again', 'an', 'any', 'as', 'ask', 'by', 'could', 'every', 'fly', 'from', 'give', 'going', 'had', 'has', 'her', 'him', 'his', 'how', 'just', 'know', 'let', 'live', 'may', 'of', 'old', 'once', 'open', 'over', 'put', 'round', 'some', 'stop', 'take', 'thank', 'them', 'then', 'think', 'walk', 'were', 'when'],
  grade2: ['always', 'around', 'because', 'been', 'before', 'best', 'both', 'buy', 'call', 'cold', 'does', "don't", 'fast', 'first', 'five', 'found', 'gave', 'goes', 'green', 'its', 'made', 'many', 'off', 'or', 'pull', 'read', 'right', 'sing', 'sit', 'sleep', 'tell', 'their', 'these', 'those', 'upon', 'us', 'use', 'very', 'wash', 'which', 'why', 'wish', 'work', 'would', 'write', 'your']
};
```

### **Balloon Mechanics**
- **Float Speed:** Starts slow (3 seconds to top), increases to 1.5 seconds
- **Spawn Rate:** 1 balloon every 2 seconds → every 0.5 seconds
- **Target Ratio:** 40% target words, 60% distractors
- **Distractors:** Previously learned sight words + decodable words

### **UI Components**
- **Balloon:** 100px diameter, word centered, gentle bobbing animation
- **Target Display:** Large word at top with speaker icon
- **Score Board:** Points + streak counter
- **Lives:** 3 hearts for wrong taps
- **Progress Bar:** Words mastered in current level

### **Scoring System**
```
Base Points:
- Correct target: +10 points
- Wrong balloon: -5 points, lose heart
- Missed target: -5 points (floats off screen)

Bonuses:
- Streak (5+ correct): +2 per balloon
- Speed bonus: Pop within 1 second = +5
- Perfect round (no misses): +50
```

### **Mastery Tracking**
- Word marked "mastered" after 10 correct identifications
- Mastery requires: < 2 seconds response time
- Review cycle: Mastered words reappear as distractors

### **Accessibility**
- Large touch targets (100px balloons)
- Option to slow down balloon speed
- Audio support (word spoken on spawn)
- No reading pressure (recognition only)

---

## Implementation Priority Summary

### **Phase 1: Core Skills (Build First)**
1. **Word Builder** - Phonics/encoding foundation
2. **Sound Detective** - Phonemic awareness
3. **Word Pop** - Sight word automaticity

### **Phase 2: Comprehension & Fluency**
4. **Story Sequencing** - Narrative structure
5. **Reading Racetrack** - Fluency building
6. **Question Quest** - Comprehension strategies

### **Phase 3: Advanced Skills**
7-15. Additional games as bandwidth allows

### **Total Development Estimate**
- **6 Priority Games:** ~18-20 days
- **Full 15 Games:** ~40-45 days
- **Content Creation (passages, images):** Parallel effort, ~10 days

### **Content Requirements**
- **Word Builder:** 100 CVC words with images
- **Story Sequencing:** 30 story sets (90-120 scenes)
- **Reading Racetrack:** 40 decodable passages
- **Sound Detective:** 150 words across positions
- **Question Quest:** 50 passages with 150 questions
- **Word Pop:** 150 sight words organized by level

---

## Next Steps

1. **Approve game designs** - Any changes needed?
2. **Prioritize build order** - Which 3 to start with?
3. **Content preparation** - Begin creating word lists, passages, images
4. **Technical architecture** - Design shared game components
5. **Teacher dashboard updates** - How to track new game data

Which games would you like me to start building first?
