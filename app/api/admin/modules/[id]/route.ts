import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { sql } from '@/lib/db';
import { moduleSchema } from '@/lib/validations';

// PUT - Update module
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
    const validatedData = moduleSchema.parse(body);

    const result = await sql`
      UPDATE modules
      SET 
        module_name = ${validatedData.moduleName},
        study_level = ${validatedData.studyLevel},
        specialty_id = ${validatedData.specialtyId || null},
        semester = ${validatedData.semester || null},
        is_active_for_current_year = ${validatedData.isActive !== undefined ? validatedData.isActive : true},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, module: result[0] },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update module error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update module' },
      { status: 500 }
    );
  }
}

// DELETE - Delete module
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
      DELETE FROM modules
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Module deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete module error:', error);
    return NextResponse.json(
      { error: 'Failed to delete module' },
      { status: 500 }
    );
  }
}
