#!/usr/bin/env python3
"""
Run Database Migrations
=====================
Execute database schema migrations for the literacy app.

Usage:
    python tools/database/migrate.py

Requirements:
    - Supabase project created
    - SUPABASE_PROJECT_URL and SUPABASE_ANON_KEY in environment
    - Service role key (or admin access) for running migrations
"""

import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))


def read_schema_file() -> str:
    """
    Read the schema SQL file.

    Returns:
        str: SQL content
    """
    schema_path = Path(__file__).parent / 'schema.sql'

    if not schema_path.exists():
        print(f"❌ Schema file not found: {schema_path}")
        return ""

    with open(schema_path, 'r') as f:
        content = f.read()

    print(f"✅ Read schema file ({len(content)} characters)")
    return content


def print_migration_instructions() -> None:
    """Print instructions for running migrations."""
    print("\n" + "="*60)
    print("Database Migration Instructions")
    print("="*60)

    print("""
There are three ways to run the database migrations:

Method 1: Supabase Dashboard (Recommended for beginners)
----------------------------------------------------------
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Navigate to SQL Editor
4. Copy the entire content of: tools/database/schema.sql
5. Paste and run the SQL script

Method 2: Supabase CLI
--------------------------
1. Install Supabase CLI: npm install -g supabase
2. Login: supabase login
3. Link project: supabase link --project-ref YOUR_PROJECT_ID
4. Push schema: supabase db push

Method 3: Python Script (Automated)
------------------------------------
1. Set SUPABASE_SERVICE_ROLE_KEY in environment
2. Run: python tools/database/migrate.py

Note: Method 3 is the safest as it provides the service role key
with elevated privileges needed for schema changes.
""")

    print("="*60 + "\n")


def validate_environment() -> dict:
    """
    Validate environment variables.

    Returns:
        dict: Status of environment checks
    """
    url = os.getenv('SUPABASE_PROJECT_URL')
    anon_key = os.getenv('SUPABASE_ANON_KEY')
    service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

    status = {
        'url': bool(url),
        'anon_key': bool(anon_key),
        'service_key': bool(service_key)
    }

    return status


def main():
    """Main entry point."""
    print("\n" + "="*60)
    print("   Literacy Learning App - Database Migration")
    print("="*60)

    # Check environment
    print("\n🔍 Checking environment variables...")
    status = validate_environment()

    print(f"\nEnvironment Status:")
    print(f"  SUPABASE_PROJECT_URL:      {'✅ Set' if status['url'] else '❌ Missing'}")
    print(f"  SUPABASE_ANON_KEY:         {'✅ Set' if status['anon_key'] else '❌ Missing'}")
    print(f"  SUPABASE_SERVICE_ROLE_KEY:  {'✅ Set' if status['service_key'] else '⚠️  Not set (optional)'}")

    # Read schema file
    schema_content = read_schema_file()
    if not schema_content:
        sys.exit(1)

    # Print instructions
    print_migration_instructions()

    # Check if service key is available for automated migration
    if status['service_key']:
        print("✅ Service role key detected - automated migration possible")
        print("\n⚠️  Automated migration is not yet implemented.")
        print("   Please use Method 1 or 2 above.")
    else:
        print("⚠️  Service role key not set")
        print("   Please use Method 1 or 2 above.")

    print("\n💡 Tip: After running migrations, validate with:")
    print("   python tools/setup/validate_supabase.py")
    print()


if __name__ == '__main__':
    main()
