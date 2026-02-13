# Tools Manifest

> Master list of all available tools and their functions.
> Check this before creating new scripts.

| Tool | Description | Location |
|------|-------------|----------|
| schema.sql | Complete database schema for literacy app with RLS policies | tools/database/ |
| init_project.py | Initialize Next.js project with required dependencies | tools/setup/ |
| validate_firebase.py | Test Firebase connection and credentials | tools/setup/ |
| migrate.py | Run database migrations | tools/database/ |
| seed.py | Seed database with sample data | tools/database/ |
| memory_db.py | SQLite database operations for memory entries | tools/memory/ |
| memory_read.py | Read memory entries from database and files | tools/memory/ |
| memory_write.py | Write/update memory entries to database and files | tools/memory/ |
| embed_memory.py | Generate embeddings for semantic search | tools/memory/ |
| semantic_search.py | Search memory using vector similarity | tools/memory/ |
| hybrid_search.py | Combine keyword and semantic search | tools/memory/ |
| daemon.py | Long-running Telegram bot daemon with message handling | tools/messaging/ |
| telegram_client.py | CLI tool for Telegram session management | tools/messaging/ |
| simple_bot.py | Simple Telegram bot for testing | tools/messaging/ |
| test_runner.py | Stress test runner for Telegram messaging gateway | tools/messaging/ |
| database.py | Database schema for Telegram sessions and messages | tools/messaging/ |

*Last updated: 2026-02-07*
