import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';
import { z } from 'zod';

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

    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get('academicYearId');

    if (!academicYearId) {
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
        AND p.academic_year_id = ${parseInt(academicYearId)}
      ORDER BY p.priority
    `;

    return NextResponse.json({ preferences }, { status: 200 });
  } catch (error: any) {
    console.error('Get preferences error:', error);
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
