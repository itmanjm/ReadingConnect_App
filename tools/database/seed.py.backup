#!/usr/bin/env python3
"""
Seed Database with Sample Data
=============================
Populate database with initial sample data for development and testing.

Usage:
    python tools/database/seed.py [--full]

Options:
    --full    Seed all sample data (default: basic seed only)

Requirements:
    - Supabase connection
    - Database schema migrated
"""

import os
import sys
import argparse
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from supabase import create_client, Client
except ImportError:
    print("❌ Error: supabase package not installed")
    print("   Run: pip install supabase")
    sys.exit(1)


def seed_basic_activities(client: Client) -> int:
    """Seed basic activities for all 7 types."""
    print("\n📝 Seeding basic activities...")

    activities = [
        {
            'type': 'phonics',
            'title': 'Letter Hunt',
            'description': 'Find all items that start with letter of the week',
            'instructions': 'Look around the room and find 5 items that start with letter [LETTER]. Tap each item when you find it!',
            'difficulty_level': 'easy',
            'estimated_duration_minutes': 10,
            'is_interactive': True,
            'has_audio': False,
            'is_printable': False,
            'content_data': {'letter': 'A', 'target_items': 5}
        },
        {
            'type': 'sight_words',
            'title': 'Sight Word Bingo',
            'description': 'Find and tap sight words as they are called out',
            'instructions': 'Listen to word being spoken, then tap matching word on your bingo card.',
            'difficulty_level': 'easy',
            'estimated_duration_minutes': 15,
            'is_interactive': True,
            'has_audio': True,
            'is_printable': False,
            'content_data': {'word_count': 9, 'grid_size': 3}
        },
        {
            'type': 'phonemic_awareness',
            'title': 'Sound Detective',
            'description': 'Listen and identify the first sound in words',
            'instructions': 'I will say a word. Tap the letter that makes the first sound!',
            'difficulty_level': 'easy',
            'estimated_duration_minutes': 10,
            'is_interactive': True,
            'has_audio': True,
            'is_printable': False,
            'content_data': {'words': ['cat', 'dog', 'sun', 'hat', 'map'], 'focus': 'initial_sound'}
        },
        {
            'type': 'fluency',
            'title': 'Speed Reading Challenge',
            'description': 'Read a passage as fast and accurately as you can',
            'instructions': 'When you are ready, press start and read the passage aloud. When you finish, press stop.',
            'difficulty_level': 'medium',
            'estimated_duration_minutes': 5,
            'is_interactive': True,
            'has_audio': False,
            'is_printable': False,
            'content_data': {'passage_length': '50_words', 'time_limit': 60}
        },
        {
            'type': 'comprehension',
            'title': 'Story Questions',
            'description': 'Answer questions about the story you just read',
            'instructions': 'Read the story carefully, then answer the questions below.',
            'difficulty_level': 'medium',
            'estimated_duration_minutes': 15,
            'is_interactive': True,
            'has_audio': False,
            'is_printable': False,
            'content_data': {'question_count': 5}
        },
        {
            'type': 'enjoyment',
            'title': 'Book Corner',
            'description': 'Choose a book and read for fun!',
            'instructions': 'Select a book from the shelf and enjoy reading. When you finish, tell me what you liked about it!',
            'difficulty_level': 'easy',
            'estimated_duration_minutes': 20,
            'is_interactive': True,
            'has_audio': False,
            'is_printable': False,
            'content_data': {'book_count': 5}
        },
        {
            'type': 'vocabulary',
            'title': 'Word of the Day',
            'description': 'Learn a new word and use it in a sentence',
            'instructions': "Today's word is [WORD]. Listen to how it sounds, see it used in a sentence, then make your own!",
            'difficulty_level': 'easy',
            'estimated_duration_minutes': 10,
            'is_interactive': True,
            'has_audio': True,
            'is_printable': False,
            'content_data': {'word': 'adventure', 'definition': 'An exciting experience'}
        }
    ]

    seeded_count = 0
    for activity in activities:
        try:
            result = client.table('activities').insert(activity).execute()
            if result.data:
                seeded_count += 1
                print(f"  ✅ {activity['title']}")
            else:
                print(f"  ⚠️  Failed: {activity['title']}")
        except Exception as e:
            if 'duplicate' in str(e).lower():
                print(f"  ⏭️  Already exists: {activity['title']}")
            else:
                print(f"  ❌ Failed: {activity['title']} - {e}")

    return seeded_count


def seed_comprehension_questions(client: Client) -> int:
    """Seed sample comprehension questions."""
    print("\n📝 Seeding comprehension questions...")

    # First, get an activity ID
    result = client.table('activities').select('id').eq('type', 'comprehension').limit(1).execute()

    if not result.data:
        print("  ⚠️  No comprehension activity found. Skipping questions.")
        return 0

    activity_id = result.data[0]['id']

    questions = [
        {
            'activity_id': activity_id,
            'question_text': 'What was the main character doing in the story?',
            'question_type': 'literal',
            'correct_answer': 'reading a book',
            'options': ['reading a book', 'playing outside', 'eating dinner', 'sleeping'],
            'points': 1
        },
        {
            'activity_id': activity_id,
            'question_text': 'How did the character feel at the end of the story?',
            'question_type': 'inferential',
            'correct_answer': 'happy',
            'options': ['happy', 'sad', 'angry', 'scared'],
            'points': 1
        },
        {
            'activity_id': activity_id,
            'question_text': 'What do you think will happen next?',
            'question_type': 'evaluative',
            'correct_answer': 'they will read more books',
            'options': ['they will read more books', 'they will go to sleep', 'they will eat dinner', 'they will play outside'],
            'points': 1
        }
    ]

    seeded_count = 0
    for question in questions:
        try:
            result = client.table('comprehension_questions').insert(question).execute()
            if result.data:
                seeded_count += 1
                print(f"  ✅ Question {seeded_count}")
            else:
                print(f"  ⚠️  Failed to seed question")
        except Exception as e:
            if 'duplicate' in str(e).lower():
                print(f"  ⏭️  Question already exists")
            else:
                print(f"  ❌ Failed: {e}")

    return seeded_count


def seed_vocabulary(client: Client) -> int:
    """Seed sample vocabulary words."""
    print("\n📝 Seeding vocabulary words...")

    words = [
        {
            'word': 'adventure',
            'definition': 'An exciting experience or activity',
            'example_sentence': 'The adventure through the forest was thrilling.',
            'grade_level': 1
        },
        {
            'word': 'discovery',
            'definition': 'The act of finding something for the first time',
            'example_sentence': 'The discovery of treasure made everyone excited.',
            'grade_level': 1
        },
        {
            'word': 'friendship',
            'definition': 'The relationship between friends',
            'example_sentence': 'Friendship is important for a happy life.',
            'grade_level': 1
        },
        {
            'word': 'imagination',
            'definition': 'The ability to create pictures or ideas in your mind',
            'example_sentence': 'Her imagination created wonderful stories.',
            'grade_level': 2
        },
        {
            'word': 'curiosity',
            'definition': 'A strong desire to learn or know something',
            'example_sentence': 'His curiosity led him to discover new things.',
            'grade_level': 2
        }
    ]

    seeded_count = 0
    for word_data in words:
        try:
            result = client.table('vocabulary_words').insert(word_data).execute()
            if result.data:
                seeded_count += 1
                print(f"  ✅ {word_data['word']}")
            else:
                print(f"  ⚠️  Failed: {word_data['word']}")
        except Exception as e:
            if 'duplicate' in str(e).lower():
                print(f"  ⏭️  Already exists: {word_data['word']}")
            else:
                print(f"  ❌ Failed: {word_data['word']} - {e}")

    return seeded_count


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description='Seed database with sample data')
    parser.add_argument('--full', action='store_true', help='Seed all sample data')
    args = parser.parse_args()

    print("\n" + "="*60)
    print("   Literacy Learning App - Database Seeding")
    print("="*60)

    # Connect to Supabase
    url = os.getenv('SUPABASE_PROJECT_URL')
    key = os.getenv('SUPABASE_ANON_KEY')

    if not url or not key:
        print("❌ Missing Supabase credentials")
        print("   Set SUPABASE_PROJECT_URL and SUPABASE_ANON_KEY")
        sys.exit(1)

    try:
        client: Client = create_client(url, key)
        print("✅ Connected to Supabase\n")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        sys.exit(1)

    # Seed data
    total_seeded = 0
    total_seeded += seed_basic_activities(client)

    if args.full:
        total_seeded += seed_comprehension_questions(client)
        total_seeded += seed_vocabulary(client)
    else:
        print("\n💡 Use --full flag to seed comprehension questions and vocabulary")

    # Summary
    print("\n" + "="*60)
    print(f"Seeding complete! Total records: {total_seeded}")
    print("="*60)
    print()


if __name__ == '__main__':
    main()
