import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { sql } from '@/lib/db';

// GET - List semesters (optionally filtered by academic year)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get('academicYearId');

    let semesters;
    if (academicYearId) {
      semesters = await sql`
        SELECT s.*, ay.year_name
        FROM semesters s
        JOIN academic_years ay ON s.academic_year_id = ay.id
        WHERE s.academic_year_id = ${parseInt(academicYearId)}
        ORDER BY s.semester_number
      `;
    } else {
      semesters = await sql`
        SELECT s.*, ay.year_name
        FROM semesters s
        JOIN academic_years ay ON s.academic_year_id = ay.id
        ORDER BY ay.start_date DESC, s.semester_number
      `;
    }

    return NextResponse.json({ semesters }, { status: 200 });
  } catch (error: any) {
    console.error('Get semesters error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch semesters' },
      { status: 500 }
    );
  }
}
