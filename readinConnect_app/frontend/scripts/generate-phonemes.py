#!/usr/bin/env python3
"""
Edge TTS Phoneme Generator for ReadinConnect
Generates all 42 Jolly Phonics phonemes using Microsoft Edge's free TTS service
"""

import edge_tts
import asyncio
import json
import sys
from pathlib import Path
from typing import Dict, Any

# Configuration
PHONEMES_FILE = "phonemes/phoneme-mapping.json"
OUTPUT_DIR = "public/audio/phonemes"
FALLBACK_VOICE = "en-GB-LibbyNeural"

# Color codes for terminal output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"

def print_success(message: str):
    print(f"{GREEN}✅ {message}{RESET}")

def print_error(message: str):
    print(f"{RED}❌ {message}{RESET}")

def print_info(message: str):
    print(f"{BLUE}ℹ️  {message}{RESET}")

def print_warning(message: str):
    print(f"{YELLOW}⚠️  {message}{RESET}")

def load_phonemes(file_path: str) -> Dict[str, Any]:
    """Load phoneme mapping from JSON file"""
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print_error(f"Phoneme mapping file not found: {file_path}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print_error(f"Invalid JSON in phoneme mapping file: {e}")
        sys.exit(1)

def ensure_output_directory(dir_path: str):
    """Create output directory if it doesn't exist"""
    Path(dir_path).mkdir(parents=True, exist_ok=True)
    print_info(f"Output directory: {dir_path}")

async def generate_phoneme(phoneme_id: str, phoneme_data: Dict[str, Any], output_dir: str) -> bool:
    """Generate a single phoneme audio file"""
    try:
        text = phoneme_data["text"]
        voice = phoneme_data.get("voice", FALLBACK_VOICE)
        rate = phoneme_data.get("rate", "+0%")
        output_path = f"{output_dir}/{phoneme_id}.mp3"
        
        # Create Edge TTS communicate object
        communicate = edge_tts.Communicate(text, voice)
        
        # Apply rate if specified
        if rate:
            communicate = edge_tts.Communicate(text, voice, rate=rate)
        
        # Save audio file
        await communicate.save(output_path)
        
        # Check file was created
        if Path(output_path).exists():
            file_size = Path(output_path).stat().st_size
            print_success(f"{phoneme_id}: {text} ({file_size} bytes)")
            return True
        else:
            print_error(f"{phoneme_id}: File not created")
            return False
            
    except Exception as e:
        print_error(f"{phoneme_id}: {str(e)}")
        return False

async def generate_all_phonemes(phonemes: Dict[str, Any], output_dir: str) -> Dict[str, bool]:
    """Generate all phonemes in parallel"""
    print_info(f"Generating {len(phonemes)} phonemes...")
    print_info("Using parallel processing for faster generation")
    print()
    
    results = {}
    
    # Create tasks for all phonemes
    tasks = []
    for phoneme_id, phoneme_data in phonemes.items():
        task = generate_phoneme(phoneme_id, phoneme_data, output_dir)
        tasks.append((phoneme_id, task))
    
    # Execute all tasks
    for phoneme_id, task in tasks:
        result = await task
        results[phoneme_id] = result
    
    return results

def generate_manifest(phonemes: Dict[str, Any], output_dir: str):
    """Generate manifest file with phoneme metadata"""
    total_size = sum(
        f.stat().st_size 
        for f in Path(output_dir).glob("*.mp3")
    )
    
    manifest = {
        "version": "1.0.0",
        "baseUrl": "/audio/phonemes/",
        "phonemes": {
            phoneme_id: f"{phoneme_id}.mp3"
            for phoneme_id in phonemes.keys()
        },
        "metadata": {
            "totalSize": total_size,
            "totalSizeHuman": f"{total_size / 1024:.1f}KB",
            "phonemeCount": len(phonemes),
            "voice": "en-GB-LibbyNeural",
            "format": "mp3"
        },
        "generatedAt": "2026-02-28T14:00:00Z"
    }
    
    manifest_path = f"{output_dir}/manifest.json"
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print_success(f"Manifest created: {manifest_path}")
    print_info(f"Total size: {total_size / 1024:.1f}KB")

def print_summary(results: Dict[str, bool]):
    """Print generation summary"""
    total = len(results)
    successful = sum(1 for v in results.values() if v)
    failed = total - successful
    
    print()
    print("=" * 60)
    print("PHONEME GENERATION SUMMARY")
    print("=" * 60)
    print(f"Total phonemes:  {total}")
    print(f"{GREEN}Successful:       {successful}{RESET}")
    if failed > 0:
        print(f"{RED}Failed:           {failed}{RESET}")
    print(f"Success rate:     {(successful / total * 100):.1f}%")
    print("=" * 60)
    
    if failed > 0:
        print()
        print_error("Failed phonemes:")
        for phoneme_id, success in results.items():
            if not success:
                print(f"  - {phoneme_id}")

def print_jolly_phonics_groups(phonemes: Dict[str, Any]):
    """Print phonemes organized by Jolly Phonics groups"""
    print()
    print("=" * 60)
    print("JOLLY PHONICS GROUPS")
    print("=" * 60)
    
    groups = {}
    for phoneme_id, data in phonemes.items():
        group = data.get("jollyPhonicsGroup", 0)
        if group not in groups:
            groups[group] = []
        groups[group].append(phoneme_id)
    
    for group in sorted(groups.keys()):
        if group == 0:
            continue
        print(f"\nGroup {group}:")
        phonemes_list = ", ".join(sorted(groups[group]))
        print(f"  {phonemes_list}")

def main():
    """Main entry point"""
    print("=" * 60)
    print("EDGE TTS PHONEME GENERATOR")
    print("ReadinConnect - Jolly Phonics Replacement")
    print("=" * 60)
    print()
    
    # Ensure we're in the right directory
    script_dir = Path(__file__).parent
    
    # Load phoneme mapping
    phonemes = load_phonemes(PHONEMES_FILE)
    print_info(f"Loaded {len(phonemes)} phonemes from {PHONEMES_FILE}")
    
    # Create output directory
    output_dir = script_dir / OUTPUT_DIR
    output_dir.mkdir(parents=True, exist_ok=True)
    print_info(f"Output directory: {output_dir}")
    print()
    
    # Print Jolly Phonics groups
    print_jolly_phonics_groups(phonemes)
    print()
    
    # Generate all phonemes
    print_info("Starting phoneme generation...")
    print_info("This may take 1-2 minutes depending on your internet connection")
    print()
    
    results = asyncio.run(generate_all_phonemes(phonemes, str(output_dir)))
    
    # Generate manifest
    generate_manifest(phonemes, str(output_dir))
    
    # Print summary
    print_summary(results)
    
    # Return success if all phonemes generated
    return 0 if all(results.values()) else 1

if __name__ == "__main__":
    sys.exit(main())
