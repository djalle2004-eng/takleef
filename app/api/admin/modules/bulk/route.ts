import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { sql } from '@/lib/db';

// Bulk toggle module availability
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { moduleIds, isActive } = body;

    if (!Array.isArray(moduleIds) || moduleIds.length === 0) {
      return NextResponse.json(
        { error: 'Module IDs array is required' },
        { status: 400 }
      );
    }

    // Update multiple modules at once
    await sql`
      UPDATE modules
      SET is_active_for_current_year = ${isActive}
      WHERE id = ANY(${moduleIds})
    `;

    return NextResponse.json(
      { 
        success: true,
        message: `${moduleIds.length} modules updated successfully`
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Bulk update modules error:', error);
    return NextResponse.json(
      { error: 'Failed to update modules', details: error.message },
      { status: 500 }
    );
  }
}

// Bulk delete modules
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json(
        { error: 'Module IDs are required' },
        { status: 400 }
      );
    }

    const moduleIds = idsParam.split(',').map(id => parseInt(id));

    // Delete multiple modules
    await sql`
      DELETE FROM modules
      WHERE id = ANY(${moduleIds})
    `;

    return NextResponse.json(
      { 
        success: true,
        message: `${moduleIds.length} modules deleted successfully`
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Bulk delete modules error:', error);
    return NextResponse.json(
      { error: 'Failed to delete modules', details: error.message },
      { status: 500 }
    );
  }
}

// Bulk import modules
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { modules } = body;

    if (!Array.isArray(modules) || modules.length === 0) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const module of modules) {
      try {
        if (!module.moduleName || !module.studyLevel) {
          results.failed++;
          results.errors.push(`Missing required fields for ${module.moduleName || 'unknown'}`);
          continue;
        }

        await sql`
          INSERT INTO modules (
            module_name,
            study_level,
            specialty_id,
            semester,
            is_active_for_current_year
          )
          VALUES (
            ${module.moduleName},
            ${module.studyLevel},
            ${module.specialtyId || null},
            ${module.semester || null},
            ${module.isActive !== undefined ? module.isActive : true}
          )
        `;

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Error importing ${module.moduleName}: ${error.message}`);
      }
    }

    return NextResponse.json(
      { 
        message: 'Import completed',
        results
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Import modules error:', error);
    return NextResponse.json(
      { error: 'Failed to import modules', details: error.message },
      { status: 500 }
    );
  }
}
