import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST() {
  try {
    // Create semesters table
    await sql`
      CREATE TABLE IF NOT EXISTS semesters (
        id SERIAL PRIMARY KEY,
        semester_name VARCHAR(50) NOT NULL,
        semester_number INTEGER NOT NULL,
        academic_year_id INTEGER NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(academic_year_id, semester_number)
      )
    `;

    // Update modules table to link to semesters instead of academic_year_id
    await sql`
      ALTER TABLE modules 
      ADD COLUMN IF NOT EXISTS semester_id INTEGER REFERENCES semesters(id) ON DELETE SET NULL
    `;

    // For existing academic years, create semesters
    const existingYears = await sql`
      SELECT id, year_name, start_date, end_date FROM academic_years
    `;

    for (const year of existingYears) {
      // Check if semesters already exist for this year
      const existingSemesters = await sql`
        SELECT COUNT(*) as count FROM semesters WHERE academic_year_id = ${year.id}
      `;

      if (existingSemesters[0].count === 0) {
        // Calculate semester dates (split year in half)
        const startDate = new Date(year.start_date);
        const endDate = new Date(year.end_date);
        const midDate = new Date((startDate.getTime() + endDate.getTime()) / 2);

        // Create Semester 1
        await sql`
          INSERT INTO semesters (semester_name, semester_number, academic_year_id, start_date, end_date)
          VALUES (
            'Semester 1',
            1,
            ${year.id},
            ${year.start_date},
            ${midDate.toISOString().split('T')[0]}
          )
        `;

        // Create Semester 2
        await sql`
          INSERT INTO semesters (semester_name, semester_number, academic_year_id, start_date, end_date)
          VALUES (
            'Semester 2',
            2,
            ${year.id},
            ${midDate.toISOString().split('T')[0]},
            ${year.end_date}
          )
        `;
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Semesters table created and semesters added to existing academic years'
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Semesters migration error:', error);
    return NextResponse.json(
      { error: 'Failed to migrate semesters', details: error.message },
      { status: 500 }
    );
  }
}
