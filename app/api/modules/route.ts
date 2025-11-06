import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';

// GET - List modules (available for all authenticated users)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const specialtyId = searchParams.get('specialtyId');
    const department = searchParams.get('department');
    const activeOnly = searchParams.get('activeOnly');

    let modules;
    
    if (department && department !== '') {
      // Filter by department
      if (activeOnly === 'true') {
        modules = await sql`
          SELECT m.*, s.name as specialty_name, s.level as specialty_level, d.name as department_name
          FROM modules m
          LEFT JOIN specialties s ON m.specialty_id = s.id
          LEFT JOIN departments d ON s.department_id = d.id
          WHERE d.name = ${department} AND m.is_active_for_current_year = true
          ORDER BY m.semester, m.module_name
        `;
      } else {
        modules = await sql`
          SELECT m.*, s.name as specialty_name, s.level as specialty_level, d.name as department_name
          FROM modules m
          LEFT JOIN specialties s ON m.specialty_id = s.id
          LEFT JOIN departments d ON s.department_id = d.id
          WHERE d.name = ${department}
          ORDER BY m.semester, m.module_name
        `;
      }
    } else if (specialtyId) {
      // Filter by specialty
      modules = await sql`
        SELECT m.*, s.name as specialty_name, s.level as specialty_level
        FROM modules m
        LEFT JOIN specialties s ON m.specialty_id = s.id
        WHERE m.specialty_id = ${parseInt(specialtyId)}
        ORDER BY m.semester, m.module_name
      `;
    } else {
      // Get all modules
      if (activeOnly === 'true') {
        modules = await sql`
          SELECT m.*, s.name as specialty_name, s.level as specialty_level, d.name as department_name
          FROM modules m
          LEFT JOIN specialties s ON m.specialty_id = s.id
          LEFT JOIN departments d ON s.department_id = d.id
          WHERE m.is_active_for_current_year = true
          ORDER BY s.name, m.semester, m.module_name
        `;
      } else {
        modules = await sql`
          SELECT m.*, s.name as specialty_name, s.level as specialty_level, d.name as department_name
          FROM modules m
          LEFT JOIN specialties s ON m.specialty_id = s.id
          LEFT JOIN departments d ON s.department_id = d.id
          ORDER BY s.name, m.semester, m.module_name
        `;
      }
    }

    return NextResponse.json({ modules }, { status: 200 });
  } catch (error: any) {
    console.error('Get modules error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    );
  }
}
