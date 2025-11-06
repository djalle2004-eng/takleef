import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { sql } from '@/lib/db';
import { academicYearSchema } from '@/lib/validations';

// PUT - Update academic year
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
    const validatedData = academicYearSchema.parse(body);

    // If this year is set as active, deactivate all others
    if (validatedData.isActive) {
      await sql`
        UPDATE academic_years 
        SET is_active = FALSE 
        WHERE id != ${id}
      `;
    }

    const result = await sql`
      UPDATE academic_years
      SET 
        year_name = ${validatedData.yearName},
        start_date = ${validatedData.startDate},
        end_date = ${validatedData.endDate},
        is_active = ${validatedData.isActive || false},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Academic year not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, academicYear: result[0] },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update academic year error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update academic year' },
      { status: 500 }
    );
  }
}

// DELETE - Delete academic year
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
      DELETE FROM academic_years
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Academic year not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Academic year deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete academic year error:', error);
    return NextResponse.json(
      { error: 'Failed to delete academic year' },
      { status: 500 }
    );
  }
}

// PATCH - Archive academic year
export async function PATCH(
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
    const { isArchived } = body;

    const result = await sql`
      UPDATE academic_years
      SET 
        is_archived = ${isArchived},
        is_active = ${isArchived ? false : sql`is_active`},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Academic year not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, academicYear: result[0] },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Archive academic year error:', error);
    return NextResponse.json(
      { error: 'Failed to archive academic year' },
      { status: 500 }
    );
  }
}
