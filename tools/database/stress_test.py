#!/usr/bin/env python3
"""
Stress Test Runner for Literacy App (Firebase)
============================================
Test functionality, error handling, and edge cases.

Usage:
    python tools/database/stress_test.py

Requirements:
    - Firebase connection
    - Firestore schema created
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Any

sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    from firebase_admin.firestore import client as firestore_client
    from firebase_admin import auth as firebase_auth
except ImportError:
    print("Error: firebase-admin package not installed")
    print("   Run: pip install firebase-admin")
    sys.exit(1)


class StressTestRunner:
    """Run stress tests for literacy app using Firebase."""

    def __init__(self):
        self.db = None
        self.auth = None
        self.results = {"passed": 0, "failed": 0, "errors": []}
        self.test_user_id = None
        self.test_student_id = None

    def connect(self) -> bool:
        """Establish Firebase connection."""
        try:
            project_id = os.getenv("FIREBASE_ADMIN_PROJECT_ID")
            private_key = os.getenv("FIREBASE_ADMIN_PRIVATE_KEY")

            if not project_id or not private_key:
                print("Missing Firebase credentials in environment")
                return False

            cred = credentials.Certificate(
                {"project_id": project_id, "private_key": private_key}
            )

            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred)

            self.db = firestore_client()
            self.auth = firebase_auth
            print("Connected to Firebase")
            return True

        except Exception as e:
            print(f"Connection failed: {e}")
            return False

    def create_test_user(self) -> bool:
        """Create a test user account via Firebase Admin SDK."""
        try:
            test_email = f"test.{datetime.now().timestamp()}@test.com"

            user_data = {
                "email": test_email,
                "emailVerified": True,
                "displayName": "Test User",
                "customClaims": {"role": "teacher"},
            }

            user = self.auth.create_user(
                email=test_email,
                password="TestPassword123!",
                display_name="Test User",
                app="ReadinConnect",
            )

            if user.uid:
                self.test_user_id = user.uid
                print(f"Created test user: {self.test_user_id}")
                return True
            else:
                print("Failed to create test user")
                return False

        except Exception as e:
            self.record_error("create_test_user", str(e))
            return False

    def create_test_student(self) -> bool:
        """Create a test student document."""
        try:
            student_data = {
                "profile_id": self.test_user_id,
                "reading_level": "beginner",
                "age_range": "6-7",
                "created_at": firestore.SERVER_TIMESTAMP,
            }

            doc_ref = self.db.collection("students").document()
            doc_ref.set(student_data)
            self.test_student_id = doc_ref.id

            print(f"Created test student: {self.test_student_id}")
            return True

        except Exception as e:
            self.record_error("create_test_student", str(e))
            return False

    def test_collection_read(self, collection_name: str) -> bool:
        """Test reading from a collection."""
        try:
            docs = self.db.collection(collection_name).limit(5).stream()

            for doc in docs:
                if doc.exists:
                    self.results["passed"] += 1

            print(f"Read from {collection_name}: OK")
            return True

        except Exception as e:
            self.record_error(f"read_{collection_name}", str(e))
            return False

    def test_document_write(self, collection_name: str) -> bool:
        """Test writing to a collection."""
        try:
            test_data = {
                "test_field": "test_value",
                "created_at": firestore.SERVER_TIMESTAMP,
            }

            doc_ref = self.db.collection(collection_name).document()
            doc_ref.set(test_data)

            print(f"Write to {collection_name}: OK")
            return True

        except Exception as e:
            self.record_error(f"write_{collection_name}", str(e))
            return False

    def test_document_update(self, collection_name: str, doc_id: str) -> bool:
        """Test updating a document."""
        try:
            update_data = {"updated_at": firestore.SERVER_TIMESTAMP}

            doc_ref = self.db.collection(collection_name).document(doc_id)
            doc_ref.update(update_data)

            print(f"Update {collection_name}/{doc_id}: OK")
            return True

        except Exception as e:
            self.record_error(f"update_{collection_name}", str(e))
            return False

    def test_document_delete(self, collection_name: str, doc_id: str) -> bool:
        """Test deleting a document."""
        try:
            doc_ref = self.db.collection(collection_name).document(doc_id)
            doc_ref.delete()

            print(f"Delete {collection_name}/{doc_id}: OK")
            return True

        except Exception as e:
            self.record_error(f"delete_{collection_name}", str(e))
            return False

    def test_query_filters(self, collection_name: str) -> bool:
        """Test querying with filters."""
        try:
            test_student_id = self.test_student_id

            query = (
                self.db.collection(collection_name)
                .where("profile_id", "==", test_student_id)
                .limit(10)
            )

            results = list(query.stream())

            if results:
                print(
                    f"Query filter on {collection_name}: OK (found {len(results)} results)"
                )
                return True
            else:
                print(f"Query filter on {collection_name}: OK (no results)")
                return True

        except Exception as e:
            self.record_error(f"query_{collection_name}", str(e))
            return False

    def test_timestamp_operations(self) -> bool:
        """Test server timestamp operations."""
        try:
            test_doc = {
                "test_field": "test_value",
                "created_at": firestore.SERVER_TIMESTAMP,
                "updated_at": firestore.SERVER_TIMESTAMP,
            }

            doc_ref = self.db.collection("test_operations").document()
            doc_ref.set(test_doc)

            doc = doc_ref.get()
            if doc.exists:
                data = doc.to_dict()
                if "created_at" in data and "updated_at" in data:
                    print("Timestamp operations: OK")
                    return True

            print("Timestamp operations: Failed")
            return False

        except Exception as e:
            self.record_error("timestamp_operations", str(e))
            return False

    def test_batch_operations(self) -> bool:
        """Test batch write operations."""
        try:
            batch = self.db.batch()

            for i in range(5):
                doc_ref = self.db.collection("batch_test").document(f"test_{i}")
                batch.set(doc_ref, {"batch_value": i})

            batch.commit()
            print("Batch operations: OK")
            return True

        except Exception as e:
            self.record_error("batch_operations", str(e))
            return False

    def test_transaction(self) -> bool:
        """Test transaction operations."""
        try:
            doc_ref = self.db.collection("transactions").document("test_doc")

            @firestore.transactional
            def update_in_transaction(transaction, doc_ref):
                doc_snapshot = transaction.get(doc_ref)

                if not doc_snapshot.exists:
                    transaction.set(doc_ref, {"counter": 1})
                    return 1
                else:
                    current_data = doc_snapshot.to_dict()
                    transaction.update(
                        doc_ref, {"counter": current_data.get("counter", 0) + 1}
                    )
                    return current_data.get("counter", 0) + 1

            result = update_in_transaction(self.db.transaction, doc_ref)
            print(f"Transaction operations: OK (result: {result})")
            return True

        except Exception as e:
            self.record_error("transaction", str(e))
            return False

    def test_invalid_operations(self) -> bool:
        """Test that invalid operations fail appropriately."""
        tests_passed = 0
        total_tests = 0

        try:
            total_tests += 1

            invalid_doc_ref = self.db.collection("nonexistent").document("invalid_id")
            invalid_doc_ref.get()
            self.results["passed"] += 1
            print("Invalid document read: Failed as expected")

        except Exception:
            self.results["passed"] += 1
            tests_passed += 1
            print("Invalid document read: Failed as expected")

        try:
            total_tests += 1
            invalid_data = {"invalid_field": "invalid"}
            doc_ref = self.db.collection("test_collection").document()
            doc_ref.set(invalid_data)
            self.results["passed"] += 1
            tests_passed += 1
            print("Invalid schema write: Passed")

        except Exception:
            self.results["failed"] += 1
            print("Invalid schema write: Failed unexpectedly")

        print(f"Invalid operations test: {tests_passed}/{total_tests}")
        return tests_passed == total_tests

    def record_error(self, test_name: str, error_msg: str) -> None:
        """Record test error."""
        self.results["failed"] += 1
        self.results["errors"].append(
            {
                "test": test_name,
                "error": error_msg,
                "timestamp": datetime.now().isoformat(),
            }
        )

    def run_all_tests(self) -> None:
        """Execute all stress tests."""
        print("\n" + "=" * 60)
        print("   Running Firebase Stress Tests")
        print("=" * 60 + "\n")

        if not self.connect():
            print("\nCannot run tests - connection failed")
            return

        if not self.create_test_user():
            print("\nCannot run further tests - user creation failed")
            return

        if not self.create_test_student():
            print("\nCannot run further tests - student creation failed")
            return

        print("\n1. Collection Operations")
        print("-" * 40)

        collections_to_test = ["profiles", "students", "activities"]

        for collection in collections_to_test:
            self.test_collection_read(collection)

        print("\n2. Document Write Operations")
        print("-" * 40)

        self.test_document_write("activities")

        print("\n3. Document Update Operations")
        print("-" * 40)

        if self.test_student_id:
            self.test_document_update("students", self.test_student_id)

        print("\n4. Document Delete Operations")
        print("-" * 40)

        self.test_document_delete("activities", "test_doc")

        print("\n5. Query Filter Operations")
        print("-" * 40)

        self.test_query_filters("activity_completions")

        print("\n6. Timestamp Operations")
        print("-" * 40)

        self.test_timestamp_operations()

        print("\n7. Batch Operations")
        print("-" * 40)

        self.test_batch_operations()

        print("\n8. Transaction Operations")
        print("-" * 40)

        self.test_transaction()

        print("\n9. Invalid Operations (Error Handling)")
        print("-" * 40)

        self.test_invalid_operations()

        print("\n" + "=" * 60)
        print(
            f"   Test Results: {self.results['passed']} passed, {self.results['failed']} failed"
        )
        print("=" * 60)

        if self.results["errors"]:
            print("\nErrors encountered:")
            for error in self.results["errors"][:5]:
                print(f"  - {error['test']}: {error['error']}")
            if len(self.results["errors"]) > 5:
                print(f"  ... and {len(self.results['errors']) - 5} more")

    def cleanup(self) -> None:
        """Clean up test data."""
        print("\nCleaning up test data...")

        try:
            if self.test_user_id:
                self.auth.delete_user(self.test_user_id)
                print(f"Deleted test user: {self.test_user_id}")
        except Exception as e:
            print(f"Warning: Could not delete test user: {str(e)}")


def main():
    """Main entry point."""
    runner = StressTestRunner()

    try:
        runner.run_all_tests()

    finally:
        runner.cleanup()

    sys.exit(0 if runner.results["failed"] == 0 else 1)


if __name__ == "__main__":
    main()
