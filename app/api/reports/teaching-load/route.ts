import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get('academicYearId');
    const departmentFilter = searchParams.get('department');
    const professorId = searchParams.get('professorId');

    // Build query with simple approach
    let query;
    
    if (!academicYearId) {
      // No year filter - count all preferences
      query = sql`
        SELECT 
          u.id as professor_id,
          p.full_name_latin,
          p.full_name_arabic,
          p.academic_rank,
          p.department,
          COALESCE(COUNT(DISTINCT pref.id), 0) as total_preferences,
          COALESCE(COUNT(DISTINCT CASE WHEN pref.teaching_type = 'LECTURE' THEN pref.id END), 0) as lecture_count,
          COALESCE(COUNT(DISTINCT CASE WHEN pref.teaching_type = 'TUTORIAL' THEN pref.id END), 0) as tutorial_count,
          COALESCE(COUNT(DISTINCT CASE WHEN pref.teaching_type = 'BOTH' THEN pref.id END), 0) as both_count
        FROM users u
        JOIN professors p ON u.id = p.user_id
        LEFT JOIN preferences pref ON u.id = pref.professor_id
        WHERE u.role = 'PROFESSOR'
        GROUP BY u.id, p.full_name_latin, p.full_name_arabic, p.academic_rank, p.department
        ORDER BY p.department, p.full_name_latin
      `;
    } else {
      // With year filter - using CASE instead of FILTER
      const yearId = parseInt(academicYearId);
      query = sql`
        SELECT 
          u.id as professor_id,
          p.full_name_latin,
          p.full_name_arabic,
          p.academic_rank,
          p.department,
          COUNT(DISTINCT CASE WHEN pref.academic_year_id = ${yearId} THEN pref.id END) as total_preferences,
          COUNT(DISTINCT CASE WHEN pref.academic_year_id = ${yearId} AND pref.teaching_type = 'LECTURE' THEN pref.id END) as lecture_count,
          COUNT(DISTINCT CASE WHEN pref.academic_year_id = ${yearId} AND pref.teaching_type = 'TUTORIAL' THEN pref.id END) as tutorial_count,
          COUNT(DISTINCT CASE WHEN pref.academic_year_id = ${yearId} AND pref.teaching_type = 'BOTH' THEN pref.id END) as both_count
        FROM users u
        JOIN professors p ON u.id = p.user_id
        LEFT JOIN preferences pref ON u.id = pref.professor_id
        WHERE u.role = 'PROFESSOR'
        GROUP BY u.id, p.full_name_latin, p.full_name_arabic, p.academic_rank, p.department
        ORDER BY p.department, p.full_name_latin
      `;
    }
    
    const results = await query;
    const data = Array.isArray(results) ? results : (results as any).rows || results;
    
    console.log('Teaching load query results:', { 
      type: Array.isArray(results) ? 'array' : typeof results,
      hasRows: !!(results as any).rows,
      dataLength: data?.length,
      firstRow: data?.[0]
    });

    return NextResponse.json({ data: data }, { status: 200 });
  } catch (error: any) {
    console.error('Teaching load report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', details: error.message },
      { status: 500 }
    );
  }
}
