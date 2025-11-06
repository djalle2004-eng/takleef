import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST() {
  try {
    // Add role column to users table if it doesn't exist
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'PROFESSOR'
    `;

    // Update existing users to have PROFESSOR role if null
    await sql`
      UPDATE users 
      SET role = 'PROFESSOR' 
      WHERE role IS NULL
    `;

    // Create academic_years table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS academic_years (
        id SERIAL PRIMARY KEY,
        year_name VARCHAR(100) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_active BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create modules table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS modules (
        id SERIAL PRIMARY KEY,
        module_code VARCHAR(50) UNIQUE NOT NULL,
        module_name_arabic VARCHAR(255) NOT NULL,
        module_name_english VARCHAR(255) NOT NULL,
        credits INTEGER NOT NULL,
        semester INTEGER NOT NULL,
        department VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    return NextResponse.json(
      { 
        success: true, 
        message: 'Database migrated successfully. Role column added, new tables created.'
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Failed to migrate database', details: error.message },
      { status: 500 }
    );
  }
}
