#!/usr/bin/env python3
"""
Seed Firestore Database
=====================
Populate Firestore with sample data for literacy app.

Usage:
    python tools/database/seed.py

Requirements:
    - Firebase project created
    - FIREBASE_ADMIN_PROJECT_ID and FIREBASE_ADMIN_PRIVATE_KEY in environment
"""

import os
import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    from firebase_admin.firestore import client as firestore_client
except ImportError:
    print("Error: firebase-admin package not installed")
    print("   Run: pip install firebase-admin")
    sys.exit(1)

def validate_environment() -> bool:
    """Validate environment variables."""
    project_id = os.getenv('FIREBASE_ADMIN_PROJECT_ID')
    private_key = os.getenv('FIREBASE_ADMIN_PRIVATE_KEY')
    if not project_id:
        print("ERROR: FIREBASE_ADMIN_PROJECT_ID not set")
        return False
    if not private_key:
        print("ERROR: FIREBASE_ADMIN_PRIVATE_KEY not set")
        return False
    return True

def seed_sight_words(db) -> bool:
    """Seed Dolch Fry sight words."""
    print("\nSeeding sight words...")
    sight_words = [
        'the', 'and', 'a', 'to', 'in', 'is', 'you', 'that', 'it', 'he',
        'was', 'for', 'on', 'are', 'as', 'with', 'his', 'they', 'I',
        'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had',
        'by', 'words', 'but', 'not', 'what', 'all', 'were', 'we',
        'when', 'your', 'can', 'said', 'there', 'use', 'an', 'each',
        'which', 'she', 'do', 'how', 'their', 'if', 'will', 'up',
        'other', 'about', 'out', 'many', 'then', 'them', 'these',
        'so', 'some', 'her', 'would', 'make', 'like', 'him', 'into',
        'time', 'has', 'look', 'two', 'more', 'write', 'go', 'see'
    ]
    try:
        for i, word in enumerate(sight_words):
            doc_ref = db.collection('sight_words').document()
            doc_ref.set({
                'word': word,
                'frequency': 1000 - (i * 50),
                'difficulty_level': 'dolch_preprimer' if i < 20 else 'dolch_primer',
                'created_at': firestore.SERVER_TIMESTAMP
            })
            if (i + 1) % 10 == 0:
                print(f"   Seeded {i + 1} words...")
        print(f"Seeded {len(sight_words)} sight words")
        return True
    except Exception as e:
        print(f"Error seeding sight words: {str(e)}")
        return False

def seed_phonics_letters(db) -> bool:
    """Seed alphabet letters with phonemes."""
    print("\nSeeding phonics letters...")
    phonics_data = {
        'A': {'phonemes': ['æ', 'eɪ'], 'examples': ['apple', 'ate', 'ant']},
        'B': {'phonemes': ['b'], 'examples': ['ball', 'bat', 'bear']},
        'C': {'phonemes': ['k', 's'], 'examples': ['cat', 'city', 'cup']},
        'D': {'phonemes': ['d'], 'examples': ['dog', 'duck', 'door']},
        'E': {'phonemes': ['e', 'iː'], 'examples': ['egg', 'eat', 'end']},
        'F': {'phonemes': ['f'], 'examples': ['fish', 'fox', 'fun']},
        'G': {'phonemes': ['g', 'dʒ'], 'examples': ['goat', 'giraffe', 'game']},
        'H': {'phonemes': ['h'], 'examples': ['hat', 'hen', 'home']},
        'I': {'phonemes': ['ɪ', 'aɪ'], 'examples': ['igloo', 'ice', 'inch']},
        'J': {'phonemes': ['dʒ'], 'examples': ['jellyfish', 'jump', 'jar']},
        'K': {'phonemes': ['k'], 'examples': ['kite', 'kitten', 'key']},
        'L': {'phonemes': ['l'], 'examples': ['lion', 'lamp', 'leaf']},
        'M': {'phonemes': ['m'], 'examples': ['moon', 'mouse', 'map']},
        'N': {'phonemes': ['n'], 'examples': ['nest', 'net', 'nut']},
        'O': {'phonemes': ['o', 'oʊ'], 'examples': ['octopus', 'owl', 'open']},
        'P': {'phonemes': ['p'], 'examples': ['pig', 'pen', 'pan']},
        'Q': {'phonemes': ['k'], 'examples': ['queen', 'quiet', 'quilt']},
        'R': {'phonemes': ['r'], 'examples': ['rabbit', 'robot', 'red']},
        'S': {'phonemes': ['s', 'z'], 'examples': ['sun', 'snake', 'star']},
        'T': {'phonemes': ['t'], 'examples': ['tiger', 'top', 'tent']},
        'U': {'phonemes': ['ʌ', 'juː'], 'examples': ['umbrella', 'up', 'unicorn']},
        'V': {'phonemes': ['v'], 'examples': ['van', 'violin', 'vase']},
        'W': {'phonemes': ['w'], 'examples': ['whale', 'wolf', 'window']},
        'X': {'phonemes': ['ks'], 'examples': ['xray', 'xylophone', 'box']},
        'Y': {'phonemes': ['j'], 'examples': ['yarn', 'yak', 'yellow']},
        'Z': {'phonemes': ['z'], 'examples': ['zebra', 'zipper', 'zoo']}
    }
    try:
        for letter, data in phonics_data.items():
            doc_ref = db.collection('phonics_letters').document(letter)
            doc_ref.set({
                'letter': letter,
                'phonemes': data['phonemes'],
                'examples': data['examples'],
                'audio_path': f'/audio/letters/{letter}.mp3',
                'created_at': firestore.SERVER_TIMESTAMP
            })
        print(f"Seeded {len(phonics_data)} phonics letters")
        return True
    except Exception as e:
        print(f"Error seeding phonics letters: {str(e)}")
        return False

def seed_activities(db) -> bool:
    """Seed sample activities."""
    print("\nSeeding activities...")
    activities = [
        {
            'type': 'phonics',
            'title': 'Letter Hunt',
            'description': 'Find all the items that start with the letter of the week',
            'instructions': 'Look around the room and find 5 items that start with the letter [LETTER].',
            'difficulty_level': 'easy',
            'estimated_duration_minutes': 10,
            'is_interactive': True,
            'has_audio': True,
            'content_data': {'letter': 'A', 'target_items': 5}
        },
        {
            'type': 'sight_words',
            'title': 'Sight Word Bingo',
            'description': 'Find and tap the sight words as they are called out',
            'instructions': 'Listen to the word being spoken, then tap the matching word.',
            'difficulty_level': 'easy',
            'estimated_duration_minutes': 15,
            'is_interactive': True,
            'has_audio': True,
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
            'content_data': {'words': ['cat', 'dog', 'sun', 'hat'], 'focus': 'initial_sound'}
        },
        {
            'type': 'fluency',
            'title': 'Speed Reading Challenge',
            'description': 'Read the passage as fast and accurately as you can',
            'instructions': 'When you are ready, press start and read the passage aloud.',
            'difficulty_level': 'medium',
            'estimated_duration_minutes': 5,
            'is_interactive': True,
            'has_audio': True,
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
            'content_data': {'question_count': 5}
        },
        {
            'type': 'vocabulary',
            'title': 'Word of the Day',
            'description': 'Learn a new word and use it in a sentence',
            'instructions': "Today's word is [WORD]. Listen to how it sounds.",
            'difficulty_level': 'easy',
            'estimated_duration_minutes': 10,
            'is_interactive': True,
            'has_audio': True,
            'content_data': {'word': 'adventure', 'definition': 'An exciting experience'}
        },
        {
            'type': 'phonics',
            'title': 'Word Building',
            'description': 'Use magnetic letters to build words',
            'instructions': 'Listen to the sounds and put the right letters together.',
            'difficulty_level': 'medium',
            'estimated_duration_minutes': 10,
            'is_interactive': True,
            'has_audio': False,
            'content_data': {'word_length': '3_4_letters', 'type': 'cvc'}
        }
    ]
    try:
        for activity in activities:
            doc_ref = db.collection('activities').document()
            doc_ref.set({
                **activity,
                'created_at': firestore.SERVER_TIMESTAMP
            })
        print(f"Seeded {len(activities)} activities")
        return True
    except Exception as e:
        print(f"Error seeding activities: {str(e)}")
        return False

def seed_badges(db) -> bool:
    """Seed gamification badges."""
    print("\nSeeding badges...")
    badges = [
        {
            'name': 'First Steps',
            'description': 'Complete your first activity',
            'icon_url': '/badges/first_steps.png',
            'category': 'milestone',
            'criteria': {'activity_count': 1},
            'points_value': 10
        },
        {
            'name': 'Sight Word Star',
            'description': 'Master 20 sight words',
            'icon_url': '/badges/sight_word_star.png',
            'category': 'skill',
            'criteria': {'sight_words_mastered': 20},
            'points_value': 50
        },
        {
            'name': 'Phonics Pro',
            'description': 'Recognize all alphabet letters',
            'icon_url': '/badges/phonics_pro.png',
            'category': 'skill',
            'criteria': {'letters_recognized': 26},
            'points_value': 75
        },
        {
            'name': 'Reading Champion',
            'description': 'Complete 10 activities in one week',
            'icon_url': '/badges/reading_champion.png',
            'category': 'engagement',
            'criteria': {'weekly_activities': 10},
            'points_value': 100
        },
        {
            'name': 'Fluency Master',
            'description': 'Read 100 words per minute',
            'icon_url': '/badges/fluency_master.png',
            'category': 'skill',
            'criteria': {'wpm': 100},
            'points_value': 150
        },
        {
            'name': 'Week Warrior',
            'description': 'Use the app for 7 days in a row',
            'icon_url': '/badges/week_warrior.png',
            'category': 'streak',
            'criteria': {'day_streak': 7},
            'points_value': 200
        }
    ]
    try:
        for badge in badges:
            doc_ref = db.collection('badges').document()
            doc_ref.set({
                **badge,
                'created_at': firestore.SERVER_TIMESTAMP
            })
        print(f"Seeded {len(badges)} badges")
        return True
    except Exception as e:
        print(f"Error seeding badges: {str(e)}")
        return False

def main():
    """Main entry point."""
    print("\n" + "="*60)
    print("   Firestore Database Seeding")
    print("="*60)
    if not validate_environment():
        sys.exit(1)
    print("\nInitializing Firebase...")
    cred = credentials.Certificate({
        'project_id': os.getenv('FIREBASE_ADMIN_PROJECT_ID'),
        'private_key': os.getenv('FIREBASE_ADMIN_PRIVATE_KEY')
    })
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    db = firestore_client()
    success_count = 0
    total_count = 4
    if seed_sight_words(db):
        success_count += 1
    if seed_phonics_letters(db):
        success_count += 1
    if seed_activities(db):
        success_count += 1
    if seed_badges(db):
        success_count += 1
    print("\n" + "="*60)
    print(f"   Seeding Complete: {success_count}/{total_count} successful")
    print("="*60 + "\n")
    sys.exit(0 if success_count == total_count else 1)

if __name__ == '__main__':
    main()
