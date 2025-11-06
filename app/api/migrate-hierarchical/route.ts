import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST() {
  try {
    // Create departments table
    await sql`
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Pre-populate departments with the five faculty departments
    const departments = [
      'قسم العلوم الاقتصادية',
      'قسم العلوم المالية والمحاسبة',
      'قسم علوم التسيير',
      'قسم العلوم التجارية',
      'قسم الجذع المشترك'
    ];

    for (const dept of departments) {
      await sql`
        INSERT INTO departments (name)
        VALUES (${dept})
        ON CONFLICT (name) DO NOTHING
      `;
    }

    // Create specialties table
    await sql`
      CREATE TABLE IF NOT EXISTS specialties (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        level VARCHAR(50) NOT NULL,
        department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Update modules table to link to specialties
    await sql`
      ALTER TABLE modules 
      ADD COLUMN IF NOT EXISTS specialty_id INTEGER REFERENCES specialties(id) ON DELETE SET NULL
    `;

    // Add semester field if not exists (S1, S2, etc.)
    await sql`
      ALTER TABLE modules 
      ADD COLUMN IF NOT EXISTS semester VARCHAR(10)
    `;

    // Rename is_active to is_active_for_current_year if needed
    await sql`
      ALTER TABLE modules 
      ADD COLUMN IF NOT EXISTS is_active_for_current_year BOOLEAN DEFAULT TRUE
    `;

    // Copy is_active to is_active_for_current_year if exists
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'modules' AND column_name = 'is_active'
    `;

    if (checkColumn.length > 0) {
      await sql`
        UPDATE modules 
        SET is_active_for_current_year = is_active 
        WHERE is_active_for_current_year IS NULL
      `;
    }

    // Remove old department column from modules if exists
    await sql`
      ALTER TABLE modules 
      DROP COLUMN IF EXISTS department
    `;

    return NextResponse.json(
      { 
        success: true, 
        message: 'Hierarchical structure created successfully. Departments table populated with 5 departments.'
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Hierarchical migration error:', error);
    return NextResponse.json(
      { error: 'Failed to create hierarchical structure', details: error.message },
      { status: 500 }
    );
  }
}
