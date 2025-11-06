import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST() {
  try {
    // Add study_level column to modules table
    await sql`
      ALTER TABLE modules 
      ADD COLUMN IF NOT EXISTS study_level VARCHAR(50)
    `;

    // Add is_active column to modules table
    await sql`
      ALTER TABLE modules 
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE
    `;

    // Add academic_year_id column to modules table
    await sql`
      ALTER TABLE modules 
      ADD COLUMN IF NOT EXISTS academic_year_id INTEGER REFERENCES academic_years(id) ON DELETE SET NULL
    `;

    // Remove old fields that are no longer needed
    await sql`
      ALTER TABLE modules 
      DROP COLUMN IF EXISTS module_code,
      DROP COLUMN IF EXISTS module_name_arabic,
      DROP COLUMN IF EXISTS module_name_english,
      DROP COLUMN IF EXISTS credits,
      DROP COLUMN IF EXISTS semester,
      DROP COLUMN IF EXISTS academic_year_id
    `;

    // Add new module_name field
    await sql`
      ALTER TABLE modules 
      ADD COLUMN IF NOT EXISTS module_name VARCHAR(255)
    `;

    // Add is_archived column to academic_years table
    await sql`
      ALTER TABLE academic_years 
      ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE
    `;

    return NextResponse.json(
      { 
        success: true, 
        message: 'Modules schema updated successfully'
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Failed to migrate modules schema', details: error.message },
      { status: 500 }
    );
  }
}
