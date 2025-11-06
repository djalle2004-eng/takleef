import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { sql } from '@/lib/db';
import { moduleSchema } from '@/lib/validations';

// GET - List all modules
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const specialtyId = searchParams.get('specialtyId');

    let modules;
    if (specialtyId) {
      modules = await sql`
        SELECT m.*, 
               sp.name as specialty_name,
               sp.level as specialty_level,
               d.name as department_name
        FROM modules m
        LEFT JOIN specialties sp ON m.specialty_id = sp.id
        LEFT JOIN departments d ON sp.department_id = d.id
        WHERE m.specialty_id = ${parseInt(specialtyId)}
        ORDER BY m.semester, m.module_name
      `;
    } else {
      modules = await sql`
        SELECT m.*, 
               sp.name as specialty_name,
               sp.level as specialty_level,
               d.name as department_name
        FROM modules m
        LEFT JOIN specialties sp ON m.specialty_id = sp.id
        LEFT JOIN departments d ON sp.department_id = d.id
        ORDER BY d.name, sp.name, m.semester, m.module_name
      `;
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

// POST - Create new module
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = moduleSchema.parse(body);

    const result = await sql`
      INSERT INTO modules (
        module_name, 
        study_level, 
        specialty_id,
        semester,
        is_active_for_current_year
      )
      VALUES (
        ${validatedData.moduleName},
        ${validatedData.studyLevel},
        ${validatedData.specialtyId || null},
        ${validatedData.semester || null},
        ${validatedData.isActive !== undefined ? validatedData.isActive : true}
      )
      RETURNING *
    `;

    return NextResponse.json(
      { success: true, module: result[0] },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create module error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create module', details: error.message },
      { status: 500 }
    );
  }
}
