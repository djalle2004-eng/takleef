import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';
import { z } from 'zod';

async function ensureHierarchyTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS departments (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS specialties (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      level VARCHAR(50) NOT NULL,
      department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

async function ensureModulesSchema() {
  await ensureHierarchyTables();

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

async function ensurePreferencesSchema() {
  await ensureModulesSchema();

  await sql`
    CREATE TABLE IF NOT EXISTS academic_years (
      id SERIAL PRIMARY KEY,
      year_name VARCHAR(100) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      is_active BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS preferences (
      id SERIAL PRIMARY KEY,
      professor_id INTEGER NOT NULL,
      module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      academic_year_id INTEGER NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
      priority INTEGER NOT NULL,
      teaching_type VARCHAR(20) NOT NULL,
      has_taught_before BOOLEAN DEFAULT FALSE,
      years_experience INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

function parseAcademicYearId(raw: string | null) {
  if (!raw) {
    return null;
  }

  const value = Number.parseInt(raw, 10);
  if (Number.isNaN(value)) {
    throw new Error('INVALID_ACADEMIC_YEAR_ID');
  }

  return value;
}

const preferenceSchema = z
  .object({
    moduleId: z.number(),
    academicYearId: z.number(),
    priority: z.number().min(1),
    teachingType: z.enum(['LECTURE', 'TUTORIAL', 'BOTH']),
    hasTaughtBefore: z.boolean().optional(),
    yearsExperience: z
      .number()
      .min(0)
      .max(50)
      .optional(),
  })
  .superRefine((data, ctx) => {
    const taughtBefore = data.hasTaughtBefore ?? false;

    if (taughtBefore && (data.yearsExperience === undefined || data.yearsExperience === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Years of experience is required when taught before is selected.',
        path: ['yearsExperience'],
      });
    }

    if (!taughtBefore && data.yearsExperience && data.yearsExperience > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Years of experience should be zero when the module has not been taught before.',
        path: ['yearsExperience'],
      });
    }
  });

// GET - Get professor's preferences for a specific academic year
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensurePreferencesSchema();

    const { searchParams } = new URL(request.url);

    let academicYearId: number | null = null;
    try {
      academicYearId = parseAcademicYearId(searchParams.get('academicYearId'));
    } catch (error: any) {
      if (error.message === 'INVALID_ACADEMIC_YEAR_ID') {
        return NextResponse.json(
          { error: 'Invalid academicYearId parameter' },
          { status: 400 }
        );
      }
      throw error;
    }

    if (academicYearId === null) {
      return NextResponse.json(
        { error: 'Academic year ID is required' },
        { status: 400 }
      );
    }

    const preferences = await sql`
      SELECT 
        p.*,
        m.module_name,
        m.semester,
        sp.name as specialty_name,
        sp.level as specialty_level,
        d.name as department_name
      FROM preferences p
      JOIN modules m ON p.module_id = m.id
      JOIN specialties sp ON m.specialty_id = sp.id
      JOIN departments d ON sp.department_id = d.id
      WHERE p.professor_id = ${user.userId}
        AND p.academic_year_id = ${academicYearId}
      ORDER BY p.priority
    `;

    return NextResponse.json({ preferences }, { status: 200 });
  } catch (error: any) {
    console.error('Get preferences error:', error);

    if (error?.message === 'INVALID_ACADEMIC_YEAR_ID') {
      return NextResponse.json(
        { error: 'Invalid academicYearId parameter' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

// POST - Add preference
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensurePreferencesSchema();

    const body = await request.json();
    const validatedData = preferenceSchema.parse(body);

    const hasTaughtBefore = validatedData.hasTaughtBefore ?? false;
    const yearsExperience = hasTaughtBefore ? validatedData.yearsExperience ?? 0 : 0;

    // Check if priority already exists for this professor and year
    const existingPriority = await sql`
      SELECT id FROM preferences
      WHERE professor_id = ${user.userId}
        AND academic_year_id = ${validatedData.academicYearId}
        AND priority = ${validatedData.priority}
    `;

    if (existingPriority.length > 0) {
      return NextResponse.json(
        { error: `Priority ${validatedData.priority} is already used. Please choose a different priority.` },
        { status: 400 }
      );
    }

    // Check if module already selected for this year
    const existingModule = await sql`
      SELECT id FROM preferences
      WHERE professor_id = ${user.userId}
        AND academic_year_id = ${validatedData.academicYearId}
        AND module_id = ${validatedData.moduleId}
    `;

    if (existingModule.length > 0) {
      return NextResponse.json(
        { error: 'This module has already been added to your preferences for this year.' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO preferences (
        professor_id,
        module_id,
        academic_year_id,
        priority,
        teaching_type,
        has_taught_before,
        years_experience
      )
      VALUES (
        ${user.userId},
        ${validatedData.moduleId},
        ${validatedData.academicYearId},
        ${validatedData.priority},
        ${validatedData.teachingType},
        ${hasTaughtBefore},
        ${yearsExperience}
      )
      RETURNING *
    `;

    return NextResponse.json(
      { success: true, preference: result[0] },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create preference error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create preference', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove preference
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensurePreferencesSchema();

    const { searchParams } = new URL(request.url);
    const preferenceId = searchParams.get('id');

    if (!preferenceId) {
      return NextResponse.json(
        { error: 'Preference ID is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      DELETE FROM preferences
      WHERE id = ${parseInt(preferenceId)}
        AND professor_id = ${user.userId}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Preference not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Preference deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete preference error:', error);
    return NextResponse.json(
      { error: 'Failed to delete preference' },
      { status: 500 }
    );
  }
}
