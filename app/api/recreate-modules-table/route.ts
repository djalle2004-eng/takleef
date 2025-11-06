import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST() {
  try {
    // Drop the modules table completely and recreate it with the correct schema
    await sql`DROP TABLE IF EXISTS modules CASCADE`;

    // Create modules table with correct schema
    await sql`
      CREATE TABLE modules (
        id SERIAL PRIMARY KEY,
        module_name VARCHAR(255) NOT NULL,
        study_level VARCHAR(50) NOT NULL,
        specialty_id INTEGER REFERENCES specialties(id) ON DELETE CASCADE,
        semester VARCHAR(10),
        is_active_for_current_year BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    return NextResponse.json(
      { 
        success: true, 
        message: 'Modules table recreated successfully with correct schema'
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Recreate modules table error:', error);
    return NextResponse.json(
      { error: 'Failed to recreate modules table', details: error.message },
      { status: 500 }
    );
  }
}
