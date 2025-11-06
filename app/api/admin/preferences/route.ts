import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { sql } from '@/lib/db';

// GET - Get all preferences (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get('academicYearId');
    const moduleId = searchParams.get('moduleId');
    const professorId = searchParams.get('professorId');

    let query;
    
    if (moduleId) {
      // Get all professors who selected this module
      query = sql`
        SELECT 
          p.*,
          u.email,
          prof.full_name_latin,
          prof.full_name_arabic,
          prof.academic_rank,
          prof.department,
          m.module_name,
          sp.name as specialty_name,
          sp.level as specialty_level,
          ay.year_name
        FROM preferences p
        JOIN users u ON p.professor_id = u.id
        LEFT JOIN professors prof ON u.id = prof.user_id
        JOIN modules m ON p.module_id = m.id
        JOIN specialties sp ON m.specialty_id = sp.id
        JOIN academic_years ay ON p.academic_year_id = ay.id
        WHERE p.module_id = ${parseInt(moduleId)}
        ${academicYearId ? sql`AND p.academic_year_id = ${parseInt(academicYearId)}` : sql``}
        ORDER BY p.priority
      `;
    } else if (professorId) {
      // Get all preferences for a specific professor
      query = sql`
        SELECT 
          p.*,
          m.module_name,
          m.semester,
          sp.name as specialty_name,
          sp.level as specialty_level,
          d.name as department_name,
          ay.year_name
        FROM preferences p
        JOIN modules m ON p.module_id = m.id
        JOIN specialties sp ON m.specialty_id = sp.id
        JOIN departments d ON sp.department_id = d.id
        JOIN academic_years ay ON p.academic_year_id = ay.id
        WHERE p.professor_id = ${parseInt(professorId)}
        ${academicYearId ? sql`AND p.academic_year_id = ${parseInt(academicYearId)}` : sql``}
        ORDER BY p.priority
      `;
    } else {
      // Get all preferences
      query = sql`
        SELECT 
          p.*,
          u.email,
          prof.full_name_latin,
          prof.full_name_arabic,
          m.module_name,
          sp.name as specialty_name,
          ay.year_name
        FROM preferences p
        JOIN users u ON p.professor_id = u.id
        LEFT JOIN professors prof ON u.id = prof.user_id
        JOIN modules m ON p.module_id = m.id
        JOIN specialties sp ON m.specialty_id = sp.id
        JOIN academic_years ay ON p.academic_year_id = ay.id
        ${academicYearId ? sql`WHERE p.academic_year_id = ${parseInt(academicYearId)}` : sql``}
        ORDER BY ay.year_name DESC, prof.full_name_latin, p.priority
      `;
    }

    const preferences = await query;

    return NextResponse.json({ preferences }, { status: 200 });
  } catch (error: any) {
    console.error('Get admin preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences', details: error.message },
      { status: 500 }
    );
  }
}
