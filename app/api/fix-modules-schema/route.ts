import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST() {
  try {
    // Ensure all required columns exist
    await sql`
      ALTER TABLE modules 
      ADD COLUMN IF NOT EXISTS module_name VARCHAR(255)
    `;

    await sql`
      ALTER TABLE modules 
      ADD COLUMN IF NOT EXISTS study_level VARCHAR(50)
    `;

    await sql`
      ALTER TABLE modules 
      ADD COLUMN IF NOT EXISTS specialty_id INTEGER REFERENCES specialties(id) ON DELETE SET NULL
    `;

    await sql`
      ALTER TABLE modules 
      ADD COLUMN IF NOT EXISTS semester VARCHAR(10)
    `;

    await sql`
      ALTER TABLE modules 
      ADD COLUMN IF NOT EXISTS is_active_for_current_year BOOLEAN DEFAULT TRUE
    `;

    await sql`
      ALTER TABLE modules 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `;

    await sql`
      ALTER TABLE modules 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `;

    // Drop old columns that might cause conflicts
    await sql`
      ALTER TABLE modules 
      DROP COLUMN IF EXISTS department
    `;

    await sql`
      ALTER TABLE modules 
      DROP COLUMN IF EXISTS semester_id
    `;

    await sql`
      ALTER TABLE modules 
      DROP COLUMN IF EXISTS is_active
    `;

    return NextResponse.json(
      { 
        success: true, 
        message: 'Modules table schema fixed successfully'
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Fix modules schema error:', error);
    return NextResponse.json(
      { error: 'Failed to fix modules schema', details: error.message },
      { status: 500 }
    );
  }
}
