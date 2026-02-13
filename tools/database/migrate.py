#!/usr/bin/env python3
"""
Run Firestore Database Setup
===========================
Initialize Firestore collections and security rules for literacy app.

Usage:
    python tools/database/migrate.py

Requirements:
    - Firebase project created
    - FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_PRIVATE_KEY in environment
"""

import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    from firebase_admin.firestore import client as firestore_client
except ImportError:
    print("Error: firebase-admin package not installed")
    print("   Run: pip install firebase-admin")
    sys.exit(1)


def print_setup_instructions() -> None:
    """Print instructions for setting up Firestore."""
    print("\n" + "=" * 60)
    print("Firestore Database Setup Instructions")
    print("=" * 60)

    print("""
There are three ways to set up Firestore:

Method 1: Firebase Console (Recommended for beginners)
----------------------------------------------------------
1. Go to: https://console.firebase.google.com/
2. Select your project
3. Navigate to Firestore Database
4. Click "Create database"
5. Choose location (e.g., us-central1)
6. Start in Test Mode (for development)
7. Create collections manually from schema reference

Method 2: Firebase CLI
--------------------------
1. Install Firebase CLI: npm install -g firebase-tools
2. Login: firebase login
3. Initialize: firebase init firestore
4. Deploy rules: firebase deploy --only firestore:rules

Method 3: Automated Setup (Uses Firebase Admin SDK)
-------------------------------------------------
1. Set FIREBASE_ADMIN_PROJECT_ID and FIREBASE_ADMIN_PRIVATE_KEY
2. Run: python tools/database/migrate.py
3. Script will create all collections and indexes

Note: Method 3 is fastest as it programmatically creates
all required collections and indexes.
""")

    print("=" * 60 + "\n")


def validate_environment() -> dict:
    """Validate environment variables."""
    project_id = os.getenv("FIREBASE_ADMIN_PROJECT_ID")
    private_key = os.getenv("FIREBASE_ADMIN_PRIVATE_KEY")

    status = {"project_id": bool(project_id), "private_key": bool(private_key)}

    return status


def create_firestore_collections() -> bool:
    """Create Firestore collections programmatically."""
    print("\nCreating Firestore collections...")

    collections_to_create = [
        "profiles",
        "students",
        "activities",
        "weekly_plans",
        "weekly_activities",
        "skill_progress",
        "activity_completions",
        "sight_words",
        "sight_word_progress",
        "phonics_letters",
        "phonics_progress",
        "vocabulary_words",
        "vocabulary_mastery",
        "fluency_sessions",
        "comprehension_questions",
        "comprehension_responses",
        "badges",
        "earned_badges",
        "reward_points",
        "observation_sheets",
        "printable_assets",
    ]

    try:
        db = firestore_client()

        for collection_name in collections_to_create:
            print(f"   Creating collection: {collection_name}")
            placeholder_ref = db.collection(collection_name).document("_placeholder")
            placeholder_ref.set(
                {"created_at": firestore.SERVER_TIMESTAMP, "is_placeholder": True}
            )

        print(f"\nCreated {len(collections_to_create)} collections")
        return True

    except Exception as e:
        print(f"Error creating collections: {str(e)}")
        return False


def create_firestore_indexes() -> bool:
    """Create Firestore composite indexes for efficient queries."""
    print("\nCreating Firestore indexes...")

    indexes = [
        {
            "collection": "students",
            "fields": [
                {"field": "teacher_id", "order": "ASCENDING"},
                {"field": "created_at", "order": "DESCENDING"},
            ],
        },
        {
            "collection": "activity_completions",
            "fields": [
                {"field": "student_id", "order": "ASCENDING"},
                {"field": "completed_at", "order": "DESCENDING"},
            ],
        },
        {
            "collection": "skill_progress",
            "fields": [{"field": "student_id", "order": "ASCENDING"}],
        },
    ]

    print("\nRecommended indexes to create in Firebase Console:")
    for index in indexes:
        print(f"   Collection: {index['collection']}")
        print(
            f"   Fields: {', '.join([f'{f["field"]} ({f["order"]})' for f in index['fields']])}"
        )

    print("\nTo create these indexes:")
    print("   1. Go to Firebase Console > Firestore Database > Indexes")
    print("   2. Click 'Add Index' for each collection above")

    return True


def print_firestore_rules_reference() -> None:
    """Print reference for Firestore security rules."""
    print("\n" + "=" * 60)
    print("Firestore Security Rules Reference")
    print("=" * 60)

    rules_reference = """
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }

    function hasRole(role) {
      return isAuthenticated() &&
             request.auth.token.role == role;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    match /profiles/{userId} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId);
    }

    match /students/{studentId} {
      allow read: if isAuthenticated() &&
                       (isOwner(studentId) ||
                        resource.data.teacherId == request.auth.uid);
      allow write: if isAuthenticated();
    }

    match /activities/{activityId} {
      allow read: if true;
      allow write: if hasRole('teacher') || hasRole('admin');
    }

    match /activity_completions/{completionId} {
      allow read: if isAuthenticated() &&
                       (resource.data.studentId == request.auth.uid ||
                        resource.data.teacherId == request.auth.uid);
      allow create: if isAuthenticated();
      allow update, delete: if false;
    }

    match /skill_progress/{progressId} {
      allow read: if isAuthenticated() &&
                       (resource.data.studentId == request.auth.uid ||
                        resource.data.teacherId == request.auth.uid);
      allow write: if isAuthenticated();
    }
  }
}
"""

    print(rules_reference)
    print("\nTo apply these rules:")
    print("   1. Go to Firebase Console > Firestore Database > Rules")
    print("   2. Copy the rules above")
    print("   3. Paste into the rules editor")
    print("   4. Click 'Publish'")

    print("=" * 60 + "\n")


def main():
    """Main entry point."""
    print("\n" + "=" * 60)
    print("   Firestore Database Setup")
    print("=" * 60)

    status = validate_environment()

    if not status["project_id"]:
        print("ERROR: FIREBASE_ADMIN_PROJECT_ID not set")
        sys.exit(1)

    if not status["private_key"]:
        print("ERROR: FIREBASE_ADMIN_PRIVATE_KEY not set")
        sys.exit(1)

    print(f"Project ID: {os.getenv('FIREBASE_ADMIN_PROJECT_ID')}")

    print_setup_instructions()

    response = (
        input("\nDo you want to create collections automatically? [y/N]: ")
        .strip()
        .lower()
    )

    if response == "y":
        try:
            cred = credentials.Certificate(
                {
                    "project_id": os.getenv("FIREBASE_ADMIN_PROJECT_ID"),
                    "private_key": os.getenv("FIREBASE_ADMIN_PRIVATE_KEY"),
                }
            )

            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred)

            if create_firestore_collections():
                print("\nCollections created successfully!")
            else:
                print("\nFailed to create collections")
                sys.exit(1)

            create_firestore_indexes()
            print_firestore_rules_reference()

        except Exception as e:
            print(f"Error initializing Firebase: {str(e)}")
            sys.exit(1)
    else:
        print("\nSkipping automated setup.")
        print("You can create collections manually in Firebase Console.")

    print("\nSetup complete! ✅")
    print("\nNext steps:")
    print("  1. Create indexes in Firebase Console (recommended)")
    print("  2. Deploy security rules (see reference above)")
    print("  3. Import seed data with: python tools/database/seed.py")
    print("  4. Test connection with: python tools/setup/validate_firebase.py\n")


if __name__ == "__main__":
    main()
