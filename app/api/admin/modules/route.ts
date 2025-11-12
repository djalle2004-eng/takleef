import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { sql } from '@/lib/db';
import { moduleSchema } from '@/lib/validations';

async function ensureModulesSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS modules (
      id SERIAL PRIMARY KEY,
      module_name VARCHAR(255),
      study_level VARCHAR(50),
      specialty_id INTEGER REFERENCES specialties(id) ON DELETE SET NULL,
      semester VARCHAR(10),
      is_active_for_current_year BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    ALTER TABLE modules
    ADD COLUMN IF NOT EXISTS module_name VARCHAR(255)
  `;

  await sql`
    ALTER TABLE modules
    ADD COLUMN IF NOT EXISTS study_level VARCHAR(50)
  `;

  await sql`
    ALTER TABLE modules
    ADD COLUMN IF NOT EXISTS specialty_id INTEGER REFERENCES specialties(id) ON DELETE SET NULL
  `;

  await sql`
    ALTER TABLE modules
    ADD COLUMN IF NOT EXISTS semester VARCHAR(10)
  `;

  await sql`
    ALTER TABLE modules
    ADD COLUMN IF NOT EXISTS is_active_for_current_year BOOLEAN DEFAULT TRUE
  `;

  await sql`
    ALTER TABLE modules
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  `;

  await sql`
    ALTER TABLE modules
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  `;
}

function parseSpecialtyId(param: string | null) {
  if (!param) {
    return null;
  }

  const value = Number.parseInt(param, 10);
  if (Number.isNaN(value)) {
    throw new Error('INVALID_SPECIALTY_ID');
  }

  return value;
}

// GET - List all modules
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureModulesSchema();

    const { searchParams } = new URL(request.url);
    let specialtyId: number | null = null;

    try {
      specialtyId = parseSpecialtyId(searchParams.get('specialtyId'));
    } catch (error: any) {
      if (error.message === 'INVALID_SPECIALTY_ID') {
        return NextResponse.json({ error: 'Invalid specialtyId parameter' }, { status: 400 });
      }
      throw error;
    }

    let modules;
    if (specialtyId !== null) {
      modules = await sql`
        SELECT m.*, 
               sp.name as specialty_name,
               sp.level as specialty_level,
               d.name as department_name
        FROM modules m
        LEFT JOIN specialties sp ON m.specialty_id = sp.id
        LEFT JOIN departments d ON sp.department_id = d.id
        WHERE m.specialty_id = ${specialtyId}
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

    if (error?.message === 'INVALID_SPECIALTY_ID') {
      return NextResponse.json({ error: 'Invalid specialtyId parameter' }, { status: 400 });
    }

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

    await ensureModulesSchema();

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
        ${validatedData.specialtyId ?? null},
        ${validatedData.semester ?? null},
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

    if (error?.message === 'INVALID_SPECIALTY_ID') {
      return NextResponse.json(
        { error: 'Invalid specialtyId parameter' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create module', details: error.message },
      { status: 500 }
    );
  }
}
