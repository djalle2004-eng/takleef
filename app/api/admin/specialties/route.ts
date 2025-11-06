import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { sql } from '@/lib/db';
import { z } from 'zod';

const specialtySchema = z.object({
  name: z.string().min(1, 'Specialty name is required'),
  level: z.enum(['جذع مشترك', 'ليسانس', 'ماستر']),
  departmentId: z.number(),
});

// GET - List specialties (optionally filtered by department)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');

    let specialties;
    if (departmentId) {
      specialties = await sql`
        SELECT s.*, d.name as department_name,
               COUNT(DISTINCT m.id) as modules_count
        FROM specialties s
        JOIN departments d ON s.department_id = d.id
        LEFT JOIN modules m ON s.id = m.specialty_id
        WHERE s.department_id = ${parseInt(departmentId)}
        GROUP BY s.id, d.name
        ORDER BY s.level, s.name
      `;
    } else {
      specialties = await sql`
        SELECT s.*, d.name as department_name,
               COUNT(DISTINCT m.id) as modules_count
        FROM specialties s
        JOIN departments d ON s.department_id = d.id
        LEFT JOIN modules m ON s.id = m.specialty_id
        GROUP BY s.id, d.name
        ORDER BY d.name, s.level, s.name
      `;
    }

    return NextResponse.json({ specialties }, { status: 200 });
  } catch (error: any) {
    console.error('Get specialties error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch specialties' },
      { status: 500 }
    );
  }
}

// POST - Create new specialty
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = specialtySchema.parse(body);

    const result = await sql`
      INSERT INTO specialties (name, level, department_id)
      VALUES (
        ${validatedData.name},
        ${validatedData.level},
        ${validatedData.departmentId}
      )
      RETURNING *
    `;

    return NextResponse.json(
      { success: true, specialty: result[0] },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create specialty error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create specialty' },
      { status: 500 }
    );
  }
}
