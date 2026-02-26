#!/usr/bin/env python3
"""
Execute Migration 004: Add missing columns to legendas table
Run this to fix the tipo_legenda database column issue
"""

import os
import sys

def execute_migration_via_sql_editor():
    """
    Instructions for manual execution via Supabase SQL Editor
    """
    print("\n" + "="*60)
    print("[MIGRATION 004] Add Legendas Columns")
    print("="*60)
    print("\nNOTE: The Supabase REST API doesn't support direct SQL execution.")
    print("\nINSTRUCTIONS TO FIX:")
    print("\n1. Go to Supabase Dashboard:")
    print("   https://supabase.com/dashboard/project/damxbdkteskryonvgvpc/sql/new")
    print("\n2. Create a new query and paste this SQL:\n")

    migration_sql = """
-- Migration 004: Add missing columns to legendas table
-- This fixes the tipo_legenda column issue

-- Add tipo_legenda column
ALTER TABLE legendas
ADD COLUMN IF NOT EXISTS tipo_legenda VARCHAR(50) DEFAULT 'legenda';

-- Add tipo_post column
ALTER TABLE legendas
ADD COLUMN IF NOT EXISTS tipo_post VARCHAR(50);

-- Add procedimento column
ALTER TABLE legendas
ADD COLUMN IF NOT EXISTS procedimento VARCHAR(255);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_legendas_tipo_legenda
ON legendas(tipo_legenda);

CREATE INDEX IF NOT EXISTS idx_legendas_tipo_post
ON legendas(tipo_post);

CREATE INDEX IF NOT EXISTS idx_legendas_procedimento
ON legendas(procedimento);

-- Verify columns were created
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'legendas'
AND column_name IN ('tipo_legenda', 'tipo_post', 'procedimento')
ORDER BY column_name;
    """

    print(migration_sql)
    print("\n3. Click 'Run' to execute")
    print("\n4. You should see 3 rows returned in the verification query")
    print("\n" + "="*60)
    print("[SUCCESS] After running, the endpoints will be fixed:")
    print("   * GET /api/content/legendas")
    print("   * GET /api/content/ganchos")
    print("="*60 + "\n")


def save_migration_to_file():
    """Save the migration SQL to a file for easy copy-paste"""
    migration_sql = """-- Migration 004: Add missing columns to legendas table

ALTER TABLE legendas
ADD COLUMN IF NOT EXISTS tipo_legenda VARCHAR(50) DEFAULT 'legenda';

ALTER TABLE legendas
ADD COLUMN IF NOT EXISTS tipo_post VARCHAR(50);

ALTER TABLE legendas
ADD COLUMN IF NOT EXISTS procedimento VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_legendas_tipo_legenda ON legendas(tipo_legenda);
CREATE INDEX IF NOT EXISTS idx_legendas_tipo_post ON legendas(tipo_post);
CREATE INDEX IF NOT EXISTS idx_legendas_procedimento ON legendas(procedimento);

-- Verify
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'legendas'
AND column_name IN ('tipo_legenda', 'tipo_post', 'procedimento')
ORDER BY column_name;
"""

    filepath = "MIGRATION_004_COPY_TO_SUPABASE.sql"
    with open(filepath, 'w') as f:
        f.write(migration_sql)

    print(f"[OK] Migration saved to: {filepath}")
    print("   You can copy the SQL from this file into the Supabase SQL Editor")


if __name__ == "__main__":
    execute_migration_via_sql_editor()
    save_migration_to_file()

    print("\n[NEXT STEPS]")
    print("   1. Open the Supabase dashboard link above")
    print("   2. Paste and run the SQL")
    print("   3. Once complete, the endpoints will work:")
    print("      curl https://daily-prophet-gamified.vercel.app/api/content/legendas")
    print("      curl https://daily-prophet-gamified.vercel.app/api/content/ganchos")
