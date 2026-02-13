#!/usr/bin/env python3
"""
Validate Firebase Connection
=========================
Validates Firebase configuration and connection.

Usage:
    python tools/setup/validate_firebase.py

Requirements:
    - firebase-admin package: pip install firebase-admin
    - FIREBASE_ADMIN_PROJECT_ID in environment
    - FIREBASE_ADMIN_PRIVATE_KEY in environment
"""

import os
import sys
import json
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    import firebase_admin
    from firebase_admin import credentials, firestore, storage
    from firebase_admin.firestore import client as firestore_client
    from firebase_admin import auth as firebase_auth
except ImportError as e:
    print("❌ Error: firebase-admin package not installed")
    print("   Run: pip install firebase-admin")
    sys.exit(1)


def validate_connection() -> dict:
    """
    Validate Firebase connection and return status.

    Returns:
        dict: Status of validation checks
    """
    results = {
        "project_id_provided": False,
        "private_key_provided": False,
        "client_email_provided": False,
        "firestore_connection": False,
        "storage_connection": False,
        "auth_connection": False,
        "error": None,
    }

    # Check environment variables
    project_id = os.getenv("FIREBASE_ADMIN_PROJECT_ID")
    private_key = os.getenv("FIREBASE_ADMIN_PRIVATE_KEY")
    client_email = os.getenv("FIREBASE_ADMIN_CLIENT_EMAIL")

    results["project_id_provided"] = bool(project_id)
    results["private_key_provided"] = bool(private_key)
    results["client_email_provided"] = bool(client_email)

    if not project_id:
        results["error"] = "FIREBASE_ADMIN_PROJECT_ID environment variable not set"
        return results

    if not private_key:
        results["error"] = "FIREBASE_ADMIN_PRIVATE_KEY environment variable not set"
        return results

    # Validate private key format
    try:
        # Check if it's a valid JSON string or proper key format
        if private_key.startswith("{"):
            key_data = json.loads(private_key)
            if "private_key" not in key_data:
                results["error"] = (
                    "Invalid private key format (missing private_key field)"
                )
                return results
    except json.JSONDecodeError:
        # It might be a direct PEM key (starts with -----BEGIN)
        if not private_key.startswith("-----BEGIN"):
            results["error"] = "Invalid private key format"
            return results

    # Try to initialize Firebase app and test connections
    try:
        # Initialize Firebase Admin with credentials
        cred = credentials.Certificate(
            {
                "project_id": project_id,
                "private_key": private_key,
                "client_email": client_email or "",
            }
        )

        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)

        # Test Firestore connection
        try:
            db = firestore.client()
            # Try to access collections (will succeed even if empty)
            collections = db.collections()
            results["firestore_connection"] = True
        except Exception as e:
            results["error"] = f"Firestore connection failed: {str(e)}"
            return results

        # Test Storage connection
        try:
            bucket = storage.bucket()
            # Try to list buckets (will at least get our bucket)
            bucket.reload()
            results["storage_connection"] = True
        except Exception as e:
            results["error"] = f"Storage connection failed: {str(e)}"
            return results

        # Test Auth connection
        try:
            # Try to get user by UID (should work even if doesn't exist)
            try:
                firebase_auth.get_user("nonexistent_user_id")
            except firebase_auth.UserNotFoundError:
                # This is expected, means connection works
                pass
            results["auth_connection"] = True
        except Exception as e:
            results["error"] = f"Auth connection failed: {str(e)}"
            return results

        # All connections successful
        print(f"✅ Firebase connection successful!")
        print(f"   Project ID: {project_id}")
        print(f"   Firestore: ✅ Connected")
        print(f"   Storage: ✅ Connected")
        print(f"   Auth: ✅ Connected")

        return results

    except Exception as e:
        results["error"] = str(e)
        results["firestore_connection"] = False
        results["storage_connection"] = False
        results["auth_connection"] = False

        # Provide helpful error messages
        error_msg = str(e).lower()

        if "permission" in error_msg or "access" in error_msg:
            print("❌ Permission denied")
            print("   Check service account permissions in Firebase Console")
            print("   Ensure service account has Firebase Admin role")

        elif "certificate" in error_msg or "credentials" in error_msg:
            print("❌ Invalid Firebase credentials")
            print(
                "   Please check FIREBASE_ADMIN_PROJECT_ID and FIREBASE_ADMIN_PRIVATE_KEY"
            )
            print("   Ensure service account key is properly formatted")

        elif "network" in error_msg or "connection" in error_msg:
            print("❌ Network error connecting to Firebase")
            print("   Please check your internet connection")

        elif "project not found" in error_msg:
            print("❌ Project not found")
            print("   Verify FIREBASE_ADMIN_PROJECT_ID matches your Firebase project")

        else:
            print(f"❌ Unexpected error: {e}")

        return results


def print_status(results: dict) -> None:
    """Print validation status in a clean format."""
    print("\n" + "=" * 50)
    print("Firebase Connection Validation")
    print("=" * 50)

    print(f"\nEnvironment Variables:")
    print(
        f"  FIREBASE_ADMIN_PROJECT_ID:    {'✅ Set' if results['project_id_provided'] else '❌ Not set'}"
    )
    print(
        f"  FIREBASE_ADMIN_PRIVATE_KEY:    {'✅ Set' if results['private_key_provided'] else '❌ Not set'}"
    )
    print(
        f"  FIREBASE_ADMIN_CLIENT_EMAIL:   {'✅ Set' if results['client_email_provided'] else '⚠️  Optional'}"
    )

    print(f"\nConnection Status:")
    print(
        f"  Firestore: {'✅ Connected' if results['firestore_connection'] else '❌ Failed'}"
    )
    print(
        f"  Storage:   {'✅ Connected' if results['storage_connection'] else '❌ Failed'}"
    )
    print(
        f"  Auth:      {'✅ Connected' if results['auth_connection'] else '❌ Failed'}"
    )

    if results["error"]:
        print(f"\n❌ Error: {results['error']}")

    print("\n" + "=" * 50 + "\n")

    # Return exit code
    all_connected = (
        results["firestore_connection"]
        and results["storage_connection"]
        and results["auth_connection"]
    )
    return 0 if all_connected else 1


def main():
    """Main entry point."""
    print("🔍 Validating Firebase connection...\n")

    results = validate_connection()
    print_status(results)

    sys.exit(0 if results["firestore_connection"] else 1)


if __name__ == "__main__":
    main()
