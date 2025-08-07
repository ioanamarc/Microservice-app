
import asyncio
import sqlite3
from pathlib import Path


async def migrate_cache_table():
    """
    Add operation and parameters columns to existing cache_entries table.
    """
    db_path = Path("math_service.db")

    if not db_path.exists():
        print("❌ Database file not found. No migration needed.")
        return

    print("🔄 Starting cache table migration...")

    try:
        # Connect to SQLite database
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        # Check if columns already exist
        cursor.execute("PRAGMA table_info(cache_entries)")
        columns = [column[1] for column in cursor.fetchall()]

        if 'operation' in columns and 'parameters' in columns:
            print("✅ Migration already completed. Operation and parameters columns exist.")
            conn.close()
            return

        print("📝 Adding new columns...")

        # Add operation column
        if 'operation' not in columns:
            cursor.execute("""
                ALTER TABLE cache_entries 
                ADD COLUMN operation VARCHAR(50) DEFAULT 'unknown'
            """)
            print("   ✅ Added 'operation' column")

        # Add parameters column
        if 'parameters' not in columns:
            cursor.execute("""
                ALTER TABLE cache_entries 
                ADD COLUMN parameters TEXT DEFAULT '{}'
            """)
            print("   ✅ Added 'parameters' column")

        # Create index on operation column for better performance
        try:
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_cache_entries_operation 
                ON cache_entries(operation)
            """)
            print("   ✅ Created index on operation column")
        except sqlite3.Error as e:
            print(f"   ⚠️  Index creation warning: {e}")

        # Commit changes
        conn.commit()

        # Update existing records with default values
        cursor.execute("SELECT COUNT(*) FROM cache_entries WHERE operation = 'unknown'")
        unknown_count = cursor.fetchone()[0]

        if unknown_count > 0:
            print(f"   📊 Found {unknown_count} existing cache entries with unknown operation")
            print("   💡 These will show as 'unknown' until new cache entries are created")

        conn.close()

        print("✅ Migration completed successfully!")
        print("🚀 You can now restart your service to see operation names in the database.")

    except sqlite3.Error as e:
        print(f"❌ Migration failed: {e}")
        if 'conn' in locals():
            conn.close()
        raise
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        if 'conn' in locals():
            conn.close()
        raise


def main():
    """Run the migration."""
    print("=" * 60)
    print("🔧 Math Microservice Cache Table Migration")
    print("=" * 60)

    try:
        asyncio.run(migrate_cache_table())
    except KeyboardInterrupt:
        print("\n⚠️  Migration cancelled by user")
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        return 1

    return 0


if __name__ == "__main__":
    exit(main())