import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { sql } from '@/lib/db';
import { z } from 'zod';

const specialtySchema = z.object({
  name: z.string().min(1, 'Specialty name is required'),
  level: z.enum(['جذع مشترك', 'ليسانس', 'ماستر']),
  departmentId: z.number(),
});

// PUT - Update specialty
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id);
    const body = await request.json();
    const validatedData = specialtySchema.parse(body);

    const result = await sql`
      UPDATE specialties
      SET 
        name = ${validatedData.name},
        level = ${validatedData.level},
        department_id = ${validatedData.departmentId},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Specialty not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, specialty: result[0] },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update specialty error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update specialty' },
      { status: 500 }
    );
  }
}

// DELETE - Delete specialty
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id);

    const result = await sql`
      DELETE FROM specialties
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Specialty not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Specialty deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete specialty error:', error);
    return NextResponse.json(
      { error: 'Failed to delete specialty' },
      { status: 500 }
    );
  }
}
