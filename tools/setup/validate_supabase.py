#!/usr/bin/env python3
"""
Validate Supabase Connection
=========================
Validates Supabase database connection and credentials.

Usage:
    python tools/setup/validate_supabase.py

Requirements:
    - supabase package: pip install supabase
    - SUPABASE_PROJECT_URL in environment
    - SUPABASE_ANON_KEY in environment
"""

import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from supabase import create_client, Client
except ImportError:
    print("❌ Error: supabase package not installed")
    print("   Run: pip install supabase")
    sys.exit(1)


def validate_connection() -> dict:
    """
    Validate Supabase connection and return status.

    Returns:
        dict: Status of validation checks
    """
    results = {
        'url_provided': False,
        'key_provided': False,
        'connection_successful': False,
        'error': None
    }

    # Check environment variables
    url = os.getenv('SUPABASE_PROJECT_URL')
    anon_key = os.getenv('SUPABASE_ANON_KEY')

    results['url_provided'] = bool(url)
    results['key_provided'] = bool(anon_key)

    if not url:
        results['error'] = 'SUPABASE_PROJECT_URL environment variable not set'
        return results

    if not anon_key:
        results['error'] = 'SUPABASE_ANON_KEY environment variable not set'
        return results

    # Try to create client and test connection
    try:
        client: Client = create_client(url, anon_key)

        # Simple query to test connection (check if tables exist)
        # We'll try to query profiles table, which should exist in our schema
        result = client.table('profiles').select('count', count='exact').limit(1).execute()

        results['connection_successful'] = True
        print(f"✅ Supabase connection successful!")
        print(f"   URL: {url[:30]}... (truncated)")
        print(f"   Anon key: {'...' + anon_key[-10:]}")

        return results

    except Exception as e:
        results['error'] = str(e)
        results['connection_successful'] = False

        # Provide helpful error messages
        error_msg = str(e).lower()

        if 'invalid api key' in error_msg or 'invalid url' in error_msg:
            print("❌ Invalid Supabase credentials")
            print("   Please check SUPABASE_PROJECT_URL and SUPABASE_ANON_KEY")

        elif 'connection' in error_msg or 'network' in error_msg:
            print("❌ Network error connecting to Supabase")
            print("   Please check your internet connection")

        elif 'table' in error_msg and 'does not exist' in error_msg:
            print("⚠️  Database exists but tables not created")
            print("   Run migration: python tools/database/migrate.py")

        elif 'permission' in error_msg or 'authorization' in error_msg:
            print("❌ Permission denied")
            print("   Check RLS policies and service role key if needed")

        else:
            print(f"❌ Unexpected error: {e}")

        return results


def print_status(results: dict) -> None:
    """Print validation status in a clean format."""
    print("\n" + "="*50)
    print("Supabase Connection Validation")
    print("="*50)

    print(f"\nEnvironment Variables:")
    print(f"  SUPABASE_PROJECT_URL: {'✅ Set' if results['url_provided'] else '❌ Not set'}")
    print(f"  SUPABASE_ANON_KEY:    {'✅ Set' if results['key_provided'] else '❌ Not set'}")

    print(f"\nConnection Status:")
    print(f"  Connected: {'✅ Yes' if results['connection_successful'] else '❌ No'}")

    if results['error']:
        print(f"\n❌ Error: {results['error']}")

    print("\n" + "="*50 + "\n")

    # Return exit code
    return 0 if results['connection_successful'] else 1


def main():
    """Main entry point."""
    print("🔍 Validating Supabase connection...\n")

    results = validate_connection()
    print_status(results)

    sys.exit(0 if results['connection_successful'] else 1)


if __name__ == '__main__':
    main()
