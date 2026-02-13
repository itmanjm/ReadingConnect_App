#!/usr/bin/env python3
"""
Initialize Literacy Learning Project
=================================
Initialize Next.js project with required dependencies for the literacy app.

Usage:
    python tools/setup/init_project.py [project_name]

Requirements:
    - Node.js 18+
    - npm
    - create-next-app (installed automatically)
"""

import os
import sys
import subprocess
import json
from pathlib import Path
from typing import List


def run_command(cmd: List[str], description: str, check: bool = True) -> bool:
    """
    Run a command and report status.

    Args:
        cmd: Command to run as list of strings
        description: Description of what the command does
        check: Whether to check return code (default True)

    Returns:
        bool: True if successful, False otherwise
    """
    print(f"\n{'=' * 60}")
    print(f"{description}")
    print(f"{'=' * 60}")

    try:
        result = subprocess.run(cmd, check=check, capture_output=True, text=True)

        if result.stdout:
            print(result.stdout)

        if result.returncode == 0:
            print(f"✅ {description} - Success")
            return True
        else:
            print(f"❌ {description} - Failed")
            if result.stderr:
                print(f"   Error: {result.stderr}")
            return False

    except subprocess.CalledProcessError as e:
        print(f"❌ {description} - Failed")
        print(f"   Error: {e.stderr}")
        return False
    except FileNotFoundError:
        print(f"❌ {description} - Command not found")
        print(f"   Make sure required software is installed")
        return False


def check_prerequisites() -> bool:
    """Check if required software is installed."""
    print("\n🔍 Checking prerequisites...")

    checks_passed = True

    # Check Node.js
    result = subprocess.run(["node", "--version"], capture_output=True, text=True)
    if result.returncode == 0:
        print(f"✅ Node.js: {result.stdout.strip()}")
    else:
        print("❌ Node.js not found (required: 18+)")
        checks_passed = False

    # Check npm
    result = subprocess.run(["npm", "--version"], capture_output=True, text=True)
    if result.returncode == 0:
        print(f"✅ npm: {result.stdout.strip()}")
    else:
        print("❌ npm not found")
        checks_passed = False

    return checks_passed


def create_nextjs_project(project_name: str) -> bool:
    """
    Create Next.js project with required configuration.

    Args:
        project_name: Name of the project directory

    Returns:
        bool: True if successful
    """
    # Check if project already exists
    project_path = Path(project_name)
    if project_path.exists():
        print(f"\n⚠️  Project directory '{project_name}' already exists")
        response = input(f"   Delete and recreate? [y/N]: ").strip().lower()
        if response == "y":
            import shutil

            shutil.rmtree(project_path)
            print(f"   Deleted existing directory")
        else:
            print("   Aborting initialization")
            return False

    # Create project using create-next-app
    cmd = [
        "npx",
        "create-next-app@latest",
        project_name,
        "--typescript",
        "--tailwind",
        "--eslint",
        "--app",
        "--no-src-dir",
        "--import-alias",
        "@/*",
        "--use-npm",
        "--skip-git",
    ]

    success = run_command(cmd, f"Creating Next.js project: {project_name}")

    if not success:
        return False

    # Navigate to project
    os.chdir(project_name)
    print(f"✅ Changed to project directory: {os.getcwd()}")

    return True


def install_dependencies() -> bool:
    """
    Install required dependencies for the literacy app.

    Returns:
        bool: True if successful
    """
    dependencies = [
        # Firebase
        "firebase",
        # UI Components
        "@radix-ui/react-dialog",
        "@radix-ui/react-dropdown-menu",
        "@radix-ui/react-tabs",
        "@radix-ui/react-progress",
        "@radix-ui/react-avatar",
        "@radix-ui/react-alert-dialog",
        "@radix-ui/react-select",
        # Icons
        "lucide-react",
        # State Management
        "zustand",
        "@tanstack/react-query",
        # Animation
        "framer-motion",
        # PDF Generation
        "@react-pdf/renderer",
        # Utilities
        "date-fns",
        "clsx",
        "tailwind-merge",
    ]

    print(f"\n📦 Installing {len(dependencies)} dependencies...")

    success = run_command(
        ["npm", "install"] + dependencies, "Installing dependencies", check=False
    )

    return success


def install_dev_dependencies() -> bool:
    """
    Install development dependencies.

    Returns:
        bool: True if successful
    """
    dependencies = [
        "@types/node",
        "@types/react",
        "@types/react-dom",
        "typescript",
    ]

    print(f"\n📦 Installing {len(dependencies)} dev dependencies...")

    success = run_command(
        ["npm", "install", "--save-dev"] + dependencies,
        "Installing dev dependencies",
        check=False,
    )

    return success


def setup_shadcn_ui() -> bool:
    """
    Initialize shadcn/ui components.

    Returns:
        bool: True if successful
    """
    print("\n🎨 Setting up shadcn/ui...")

    # Initialize shadcn/ui
    success = run_command(
        ["npx", "shadcn-ui@latest", "init", "-y"], "Initializing shadcn/ui", check=False
    )

    if not success:
        return False

    # Add essential components
    components = [
        "button",
        "card",
        "input",
        "label",
        "tabs",
        "progress",
        "avatar",
        "dialog",
        "dropdown-menu",
        "alert-dialog",
        "select",
        "badge",
        "checkbox",
        "separator",
    ]

    print(f"\n📦 Adding {len(components)} shadcn/ui components...")

    for component in components:
        run_command(
            ["npx", "shadcn-ui@latest", "add", component],
            f"Adding {component}",
            check=False,
        )

    return True


def create_project_structure() -> bool:
    """
    Create project directory structure for literacy app.

    Returns:
        bool: True if successful
    """
    print("\n📁 Creating project structure...")

    directories = [
        "components/ui",
        "components/activities",
        "components/dashboard",
        "components/shared",
        "lib/firebase",
        "lib/db",
        "lib/stores",
        "types",
        "firebase/rules",
        "public/audio/letters",
        "public/audio/effects",
        "public/audio/stories",
        "public/images/badges",
        "public/images/illustrations",
    ]

    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"   ✅ {directory}/")

    return True


def create_env_file() -> bool:
    """
    Create .env.local file with Firebase configuration.

    Returns:
        bool: True if successful
    """
    print("\n🔐 Creating environment configuration...")

    env_content = """# Firebase Configuration
# Get these from: https://console.firebase.google.com/
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id_here

# Admin SDK (server-side only)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
"""

    with open(".env.local", "w") as f:
        f.write(env_content)

    print("✅ Created .env.local")
    print("\n⚠️  IMPORTANT: Update .env.local with your Firebase credentials")
    print("   Get credentials from: https://console.firebase.google.com/")

    return True


def create_readme() -> bool:
    """
    Create README with next steps.

    Returns:
        bool: True if successful
    """
    print("\n📝 Creating README...")

    readme_content = """# Literacy Learning App

A modern literacy education platform built with Next.js, Tailwind CSS, and Firebase.

## 🚀 Getting Started

### 1. Configure Firebase

1. Create a Firebase project at https://console.firebase.google.com/
2. Navigate to Project Settings
3. Create a Web app and get your Firebase config
4. Update `.env.local` with your credentials

### 2. Setup Firebase Database & Storage

```bash
# Create Firestore Database
# Go to Firebase Console > Firestore Database > Create Database

# Create Storage buckets
# Go to Firebase Console > Storage > Get Started
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── app/                      # Next.js app directory
├── components/                # React components
│   ├── ui/                   # shadcn/ui components
│   ├── activities/            # Activity-specific components
│   ├── dashboard/            # Dashboard components
│   └── shared/               # Shared components
├── lib/                      # Utility libraries
│   ├── firebase/             # Firebase client configuration
│   ├── db/                   # Database types and queries
│   └── stores/               # Zustand state stores
├── types/                    # TypeScript type definitions
├── firebase/                 # Firestore rules and storage config
└── public/                   # Static assets
```

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

## 📚 Documentation

- **Goal:** `goals/literacy_app.md`
- **Args:** `args/literacy_app.yaml`
- **Database:** `tools/database/schema.sql`

## 🏗️ Built With

- Next.js 14 (App Router)
- TypeScript
 - Tailwind CSS
 - shadcn/ui
 - Firebase (Firestore, Auth, Storage)
 - Zustand
 - React Query
 - Framer Motion

## 📄 License

This project is built following the GOTCHA framework.

---

*Created by ATLAS workflow*
*Generated: 2026-02-07*
"""

    with open("README.md", "w") as f:
        f.write(readme_content)

    print("✅ Created README.md")

    return True


def main():
    """Main entry point."""
    # Get project name
    if len(sys.argv) > 1:
        project_name = sys.argv[1]
    else:
        project_name = "literacy-learning"

    print("\n" + "=" * 60)
    print("   Literacy Learning App - Project Initialization")
    print("=" * 60)
    print(f"\nProject Name: {project_name}")
    print(f"Target Directory: {Path.cwd() / project_name}")

    # Step 1: Check prerequisites
    if not check_prerequisites():
        print("\n❌ Prerequisites not met. Please install required software.")
        sys.exit(1)

    # Step 2: Create Next.js project
    if not create_nextjs_project(project_name):
        print("\n❌ Failed to create Next.js project")
        sys.exit(1)

    # Step 3: Install dependencies
    if not install_dependencies():
        print("\n⚠️  Some dependencies failed to install")
        print("   You can try: npm install")

    if not install_dev_dependencies():
        print("\n⚠️  Some dev dependencies failed to install")

    # Step 4: Setup shadcn/ui
    if not setup_shadcn_ui():
        print("\n⚠️  shadcn/ui setup failed or incomplete")
        print("   You can run: npx shadcn-ui@latest init")

    # Step 5: Create project structure
    create_project_structure()

    # Step 6: Create environment file
    create_env_file()

    # Step 7: Create README
    create_readme()

    # Success!
    print("\n" + "=" * 60)
    print("✅ Project initialization complete!")
    print("=" * 60)
    print(f"\nNext steps:")
    print(f"  1. cd {project_name}")
    print(f"  2. Update .env.local with your Firebase credentials")
    print(f"  3. Setup Firestore Database in Firebase Console")
    print(f"  4. npm run dev")
    print("\nHappy building! 🎉\n")


if __name__ == "__main__":
    main()
