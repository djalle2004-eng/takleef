import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { sql } from '@/lib/db';
import { academicYearSchema } from '@/lib/validations';

// GET - List all academic years
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const academicYears = await sql`
      SELECT * FROM academic_years 
      ORDER BY start_date DESC
    `;

    return NextResponse.json({ academicYears }, { status: 200 });
  } catch (error: any) {
    console.error('Get academic years error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch academic years' },
      { status: 500 }
    );
  }
}

// POST - Create new academic year
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = academicYearSchema.parse(body);

    // If this year is set as active, deactivate all others
    if (validatedData.isActive) {
      await sql`
        UPDATE academic_years SET is_active = FALSE
      `;
    }

    const result = await sql`
      INSERT INTO academic_years (year_name, start_date, end_date, is_active)
      VALUES (
        ${validatedData.yearName},
        ${validatedData.startDate},
        ${validatedData.endDate},
        ${validatedData.isActive || false}
      )
      RETURNING *
    `;

    const academicYear = result[0];

    // Ensure semesters table exists before inserting default semesters
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

    // Ensure modules table can link to semesters (backward compatibility)
    await sql`
      ALTER TABLE modules 
      ADD COLUMN IF NOT EXISTS semester_id INTEGER REFERENCES semesters(id) ON DELETE SET NULL
    `;

    // Automatically create two semesters for this academic year
    const startDate = new Date(validatedData.startDate);
    const endDate = new Date(validatedData.endDate);
    const midDate = new Date((startDate.getTime() + endDate.getTime()) / 2);

    // Create Semester 1
    await sql`
      INSERT INTO semesters (semester_name, semester_number, academic_year_id, start_date, end_date)
      VALUES (
        'Semester 1',
        1,
        ${academicYear.id},
        ${validatedData.startDate},
        ${midDate.toISOString().split('T')[0]}
      )
    `;

    // Create Semester 2
    await sql`
      INSERT INTO semesters (semester_name, semester_number, academic_year_id, start_date, end_date)
      VALUES (
        'Semester 2',
        2,
        ${academicYear.id},
        ${midDate.toISOString().split('T')[0]},
        ${validatedData.endDate}
      )
    `;

    return NextResponse.json(
      { success: true, academicYear: academicYear },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create academic year error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create academic year' },
      { status: 500 }
    );
  }
}
