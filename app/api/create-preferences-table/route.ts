export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

const canRunInProduction = process.env.ALLOW_CREATE_PREF_TABLE === 'true';

export async function POST() {
  try {
    if (process.env.NODE_ENV === 'production' && !canRunInProduction) {
      return NextResponse.json(
        {
          error: 'This migration endpoint is disabled in production environments.',
        },
        { status: 403 }
      );
    }

    // Create preferences table
    await sql`
      CREATE TABLE IF NOT EXISTS preferences (
        id SERIAL PRIMARY KEY,
        professor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
        academic_year_id INTEGER NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
        priority INTEGER NOT NULL,
        teaching_type VARCHAR(20) NOT NULL CHECK (teaching_type IN ('LECTURE', 'TUTORIAL', 'BOTH')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(professor_id, module_id, academic_year_id),
        UNIQUE(professor_id, academic_year_id, priority)
      )
    `;

    return NextResponse.json(
      { 
        success: true, 
        message: 'Preferences table created successfully'
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Create preferences table error:', error);
    return NextResponse.json(
      { error: 'Failed to create preferences table', details: error.message },
      { status: 500 }
    );
  }
}
