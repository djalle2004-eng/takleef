import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';

// GET - List all academic years (available for all authenticated users)
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
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
