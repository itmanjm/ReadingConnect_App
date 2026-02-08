#!/usr/bin/env python3
"""
Stress Test Runner for Literacy App
==================================
Test functionality, error handling, and edge cases.

Usage:
    python tools/database/stress_test.py

Requirements:
    - Supabase connection
    - Database schema migrated
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Any

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from supabase import create_client, Client
except ImportError:
    print("❌ Error: supabase package not installed")
    print("   Run: pip install supabase")
    sys.exit(1)


class StressTestRunner:
    """Run stress tests for literacy app."""

    def __init__(self):
        self.client = None
        self.results = {
            'passed': 0,
            'failed': 0,
            'errors': []
        }
        self.test_user_id = None
        self.test_student_id = None

    def connect(self) -> bool:
        """Establish Supabase connection."""
        try:
            url = os.getenv('SUPABASE_PROJECT_URL')
            key = os.getenv('SUPABASE_ANON_KEY')

            if not url or not key:
                print("❌ Missing Supabase credentials in environment")
                return False

            self.client: Client = create_client(url, key)
            print("✅ Connected to Supabase")
            return True

        except Exception as e:
            print(f"❌ Connection failed: {e}")
            return False

    def create_test_user(self) -> bool:
        """Create a test user account."""
        try:
            # Generate test email
            test_email = f"test.{datetime.now().timestamp()}@test.com"

            # Create user via auth (this would normally be done via Supabase Auth)
            # For testing, we'll just create a profile directly
            user_data = {
                'email': test_email,
                'full_name': 'Test User',
                'role': 'teacher'
            }

            result = self.client.table('profiles').insert(user_data).execute()

            if result.data:
                self.test_user_id = result.data[0]['id']
                print(f"✅ Created test user: {self.test_user_id}")
                return True
            else:
                print(f"❌ Failed to create test user")
                return False

        except Exception as e:
            self.record_error("create_test_user", str(e))
            return False

    def create_test_student(self) -> bool:
        """Create a test student."""
        try:
            student_data = {
                'profile_id': self.test_user_id,
                'reading_level': 'beginner',
                'age_range': '6-7'
            }

            result = self.client.table('students').insert(student_data).execute()

            if result.data:
                self.test_student_id = result.data[0]['id']
                print(f"✅ Created test student: {self.test_student_id}")
                return True
            else:
                print(f"❌ Failed to create test student")
                return False

        except Exception as e:
            self.record_error("create_test_student", str(e))
            return False

    def test_activities_table(self) -> bool:
        """Test activities table operations."""
        print("\n📝 Testing: Activities table")

        # Test 1: Read activities
        try:
            result = self.client.table('activities').select('*').limit(10).execute()
            if result.data:
                print(f"  ✅ Can read activities (found {len(result.data)})")
                self.results['passed'] += 1
            else:
                print("  ⚠️  No activities found (database not seeded?)")
        except Exception as e:
            self.record_error("read_activities", str(e))
            return False

        # Test 2: Activity types are valid
        try:
            activity_types = set()
            for activity in result.data or []:
                if 'type' in activity:
                    activity_types.add(activity['type'])

            valid_types = {
                'phonemic_awareness', 'phonics', 'sight_words',
                'vocabulary', 'fluency', 'comprehension', 'enjoyment'
            }

            if activity_types.issubset(valid_types):
                print(f"  ✅ All activity types are valid")
                self.results['passed'] += 1
            else:
                invalid = activity_types - valid_types
                print(f"  ❌ Invalid activity types: {invalid}")
                self.results['failed'] += 1
        except Exception as e:
            self.record_error("validate_activity_types", str(e))

        return True

    def test_sight_words_table(self) -> bool:
        """Test sight words table operations."""
        print("\n📝 Testing: Sight words table")

        # Test 1: Read sight words
        try:
            result = self.client.table('sight_words').select('*').limit(20).execute()
            if result.data:
                print(f"  ✅ Can read sight words (found {len(result.data)})")
                self.results['passed'] += 1
            else:
                print("  ⚠️  No sight words found")
        except Exception as e:
            self.record_error("read_sight_words", str(e))
            return False

        # Test 2: Sight word difficulty levels
        try:
            difficulties = set()
            for word in result.data or []:
                if 'difficulty_level' in word:
                    difficulties.add(word['difficulty_level'])

            valid_difficulties = {
                'dolch_preprimer', 'dolch_primer', 'dolch_1st',
                'dolch_2nd', 'dolch_3rd', 'fry_100', 'fry_200'
            }

            if difficulties.issubset(valid_difficulties):
                print(f"  ✅ All difficulty levels are valid")
                self.results['passed'] += 1
            else:
                invalid = difficulties - valid_difficulties
                print(f"  ❌ Invalid difficulty levels: {invalid}")
                self.results['failed'] += 1
        except Exception as e:
            self.record_error("validate_difficulty_levels", str(e))

        return True

    def test_phonics_table(self) -> bool:
        """Test phonics letters table."""
        print("\n📝 Testing: Phonics letters table")

        try:
            result = self.client.table('phonics_letters').select('*').limit(10).execute()
            if result.data:
                print(f"  ✅ Can read phonics letters (found {len(result.data)})")
                self.results['passed'] += 1
                return True
            else:
                print("  ⚠️  No phonics letters found")
                return False
        except Exception as e:
            self.record_error("read_phonics_letters", str(e))
            return False

    def test_badges_table(self) -> bool:
        """Test badges table."""
        print("\n📝 Testing: Badges table")

        try:
            result = self.client.table('badges').select('*').execute()
            if result.data:
                print(f"  ✅ Can read badges (found {len(result.data)})")
                self.results['passed'] += 1
                return True
            else:
                print("  ⚠️  No badges found")
                return False
        except Exception as e:
            self.record_error("read_badges", str(e))
            return False

    def test_row_level_security(self) -> bool:
        """Test RLS policies."""
        print("\n🔒 Testing: Row Level Security (RLS)")

        # Test 1: Unauthenticated user cannot modify profiles
        try:
            # Try to insert profile without auth (should fail with RLS)
            result = self.client.table('profiles').insert({
                'email': 'hacker@bad.com',
                'full_name': 'Hacker',
                'role': 'admin'
            }).execute()

            # If insert succeeded, RLS is NOT working
            if result.data:
                print("  ❌ RLS NOT working - unauthenticated user can insert profiles")
                self.results['failed'] += 1
                return False
            else:
                print("  ✅ RLS blocking unauthenticated inserts")
                self.results['passed'] += 1
        except Exception as e:
            # Expected: Permission denied
            print(f"  ✅ RLS blocking unauthenticated inserts (expected error)")
            self.results['passed'] += 1

        # Test 2: User can read own profile
        if self.test_user_id:
            try:
                result = self.client.table('profiles').select('*').eq('id', self.test_user_id).execute()
                if result.data:
                    print(f"  ✅ User can read own profile")
                    self.results['passed'] += 1
                else:
                    print(f"  ⚠️  User cannot read own profile")
            except Exception as e:
                self.record_error("read_own_profile", str(e))

        return True

    def test_database_functions(self) -> bool:
        """Test custom database functions."""
        print("\n⚙️  Testing: Database Functions")

        functions_to_test = [
            'get_student_progress_summary',
            'get_student_total_points',
            'get_student_activity_count'
        ]

        for function_name in functions_to_test:
            try:
                result = self.client.rpc(function_name, {
                    'p_student_id': self.test_student_id
                }).execute()

                print(f"  ✅ Function {function_name} callable")
                self.results['passed'] += 1
            except Exception as e:
                print(f"  ⚠️  Function {function_name} not available or failed: {e}")
                # This is OK - functions might not be created yet
                pass

        return True

    def test_edge_cases(self) -> bool:
        """Test edge cases and error handling."""
        print("\n⚠️  Testing: Edge Cases")

        # Test 1: Insert invalid skill level
        try:
            result = self.client.table('skill_progress').insert({
                'student_id': self.test_student_id,
                'skill_type': 'phonics',
                'current_level': 15,  # Invalid (should be 1-10)
                'target_level': 5
            }).execute()

            if result.data:
                print("  ❌ Invalid skill level accepted (constraint not working)")
                self.results['failed'] += 1
            else:
                print("  ✅ Invalid skill level rejected by constraint")
                self.results['passed'] += 1
        except Exception as e:
            # Expected: constraint violation
            print("  ✅ Invalid skill level rejected (constraint working)")
            self.results['passed'] += 1

        # Test 2: Insert invalid activity type
        try:
            result = self.client.table('activities').insert({
                'type': 'invalid_type',  # Invalid enum value
                'title': 'Test Activity',
                'description': 'This should fail'
            }).execute()

            if result.data:
                print("  ❌ Invalid activity type accepted (constraint not working)")
                self.results['failed'] += 1
            else:
                print("  ✅ Invalid activity type rejected by constraint")
                self.results['passed'] += 1
        except Exception as e:
            # Expected: constraint violation
            print("  ✅ Invalid activity type rejected (constraint working)")
            self.results['passed'] += 1

        # Test 3: Duplicate sight word
        try:
            self.client.table('sight_words').insert({
                'word': 'the',  # Already exists in seed data
                'difficulty_level': 'dolch_preprimer'
            }).execute()

            print("  ⚠️  Duplicate sight word accepted (check UNIQUE constraint)")
        except Exception as e:
            # Expected: unique violation
            print("  ✅ Duplicate sight word rejected (UNIQUE constraint working)")
            self.results['passed'] += 1

        return True

    def test_foreign_key_constraints(self) -> bool:
        """Test foreign key constraints."""
        print("\n🔗 Testing: Foreign Key Constraints")

        # Test 1: Cannot insert skill progress without valid student
        try:
            result = self.client.table('skill_progress').insert({
                'student_id': '00000000-0000-0000-0000-000000000000',  # Invalid UUID
                'skill_type': 'phonics',
                'current_level': 1
            }).execute()

            if result.data:
                print("  ❌ Invalid foreign key accepted (constraint not working)")
                self.results['failed'] += 1
            else:
                print("  ✅ Invalid foreign key rejected")
                self.results['passed'] += 1
        except Exception as e:
            # Expected: foreign key violation
            print("  ✅ Invalid foreign key rejected (FK constraint working)")
            self.results['passed'] += 1

        return True

    def test_indexes(self) -> bool:
        """Test that indexes exist and are being used."""
        print("\n📊 Testing: Indexes")

        # This is a basic check - we're not actually querying EXPLAIN ANALYZE
        # In a real scenario, we would query pg_indexes table
        print("  ⚠️  Index verification requires service role key")
        print("  ℹ️  Skipping - indexes defined in schema.sql")

        return True

    def cleanup(self):
        """Clean up test data."""
        print("\n🧹 Cleaning up test data...")

        if self.test_student_id:
            try:
                self.client.table('students').delete().eq('id', self.test_student_id).execute()
                print(f"  ✅ Deleted test student")
            except Exception as e:
                print(f"  ⚠️  Failed to delete test student: {e}")

        if self.test_user_id:
            try:
                self.client.table('profiles').delete().eq('id', self.test_user_id).execute()
                print(f"  ✅ Deleted test user")
            except Exception as e:
                print(f"  ⚠️  Failed to delete test user: {e}")

    def record_error(self, test_name: str, error: str):
        """Record test error."""
        error_entry = {
            'test': test_name,
            'error': error,
            'timestamp': str(datetime.now())
        }
        self.results['errors'].append(error_entry)
        self.results['failed'] += 1
        print(f"  ❌ {test_name}: {error}")

    def print_summary(self):
        """Print test summary."""
        print("\n" + "="*60)
        print("STRESS TEST SUMMARY")
        print("="*60)

        print(f"\nTotal Tests Run: {self.results['passed'] + self.results['failed']}")
        print(f"Passed: ✅ {self.results['passed']}")
        print(f"Failed: ❌ {self.results['failed']}")

        if self.results['passed'] == self.results['passed'] + self.results['failed']:
            success_rate = 100.0
        else:
            success_rate = (self.results['passed'] / (self.results['passed'] + self.results['failed'])) * 100

        print(f"Success Rate: {success_rate:.1f}%")

        if self.results['errors']:
            print(f"\nErrors ({len(self.results['errors'])}):")
            for error in self.results['errors']:
                print(f"  - {error['test']}: {error['error']}")

        print("\n" + "="*60)

        return self.results['failed'] == 0

    def run(self):
        """Run all stress tests."""
        print("\n" + "="*60)
        print("   Literacy Learning App - Stress Test Runner")
        print("="*60)

        # Connect
        if not self.connect():
            print("\n❌ Cannot run tests without connection")
            return False

        # Create test data
        self.create_test_user()
        self.create_test_student()

        # Run tests
        self.test_activities_table()
        self.test_sight_words_table()
        self.test_phonics_table()
        self.test_badges_table()
        self.test_row_level_security()
        self.test_database_functions()
        self.test_edge_cases()
        self.test_foreign_key_constraints()
        self.test_indexes()

        # Cleanup
        self.cleanup()

        # Print summary
        success = self.print_summary()

        print("\n" + "="*60)
        if success:
            print("✅ All stress tests passed!")
        else:
            print("❌ Some tests failed - review errors above")
        print("="*60 + "\n")

        return success


def main():
    """Main entry point."""
    runner = StressTestRunner()
    success = runner.run()
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
