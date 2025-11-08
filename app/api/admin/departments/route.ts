import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { sql } from '@/lib/db';
import { z } from 'zod';

const departmentSchema = z.object({
  name: z.string().min(1, 'Department name is required')
});

// GET - List all departments
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const departments = await sql`
      SELECT d.*, 
             COUNT(DISTINCT s.id) as specialties_count
      FROM departments d
      LEFT JOIN specialties s ON d.id = s.department_id
      GROUP BY d.id
      ORDER BY d.name
    `;

    return NextResponse.json({ departments }, { status: 200 });
  } catch (error: any) {
    console.error('Get departments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}

// POST - Create a new department
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = departmentSchema.parse(body);

    const result = await sql`
      INSERT INTO departments (name)
      VALUES (${validated.name})
      ON CONFLICT (name) DO NOTHING
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: true, message: 'Department already exists' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, department: result[0] },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create department error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    );
  }
}
