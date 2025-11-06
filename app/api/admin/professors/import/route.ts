import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { professors } = body; // Array of professor data

    if (!Array.isArray(professors) || professors.length === 0) {
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

    for (const prof of professors) {
      try {
        // Validate required fields
        if (!prof.email || !prof.fullNameLatin) {
          results.failed++;
          results.errors.push(`Missing required fields for ${prof.email || 'unknown'}`);
          continue;
        }

        // Check if user already exists
        const existingUser = await sql`
          SELECT id FROM users WHERE email = ${prof.email}
        `;

        let userId;

        if (existingUser.length > 0) {
          userId = existingUser[0].id;
        } else {
          // Create user account
          const defaultPassword = 'Professor@123'; // Should be changed on first login
          const hashedPassword = await bcrypt.hash(defaultPassword, 10);

          const newUser = await sql`
            INSERT INTO users (email, password, role)
            VALUES (${prof.email}, ${hashedPassword}, 'PROFESSOR')
            RETURNING id
          `;
          userId = newUser[0].id;
        }

        // Check if professor profile exists
        const existingProfile = await sql`
          SELECT id FROM professors WHERE user_id = ${userId}
        `;

        if (existingProfile.length > 0) {
          // Update existing profile
          await sql`
            UPDATE professors
            SET 
              full_name_latin = ${prof.fullNameLatin},
              full_name_arabic = ${prof.fullNameArabic || null},
              academic_rank = ${prof.academicRank || null},
              department = ${prof.department || null},
              professional_email = ${prof.professionalEmail || prof.email},
              personal_email = ${prof.personalEmail || null},
              primary_phone = ${prof.primaryPhone || null},
              secondary_phone = ${prof.secondaryPhone || null},
              phd_specialization = ${prof.phdSpecialization || null},
              field_of_research = ${prof.fieldOfResearch || null},
              updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ${userId}
          `;
        } else {
          // Create new profile
          await sql`
            INSERT INTO professors (
              user_id,
              full_name_latin,
              full_name_arabic,
              academic_rank,
              department,
              professional_email,
              personal_email,
              primary_phone,
              secondary_phone,
              phd_specialization,
              field_of_research
            )
            VALUES (
              ${userId},
              ${prof.fullNameLatin},
              ${prof.fullNameArabic || null},
              ${prof.academicRank || null},
              ${prof.department || null},
              ${prof.professionalEmail || prof.email},
              ${prof.personalEmail || null},
              ${prof.primaryPhone || null},
              ${prof.secondaryPhone || null},
              ${prof.phdSpecialization || null},
              ${prof.fieldOfResearch || null}
            )
          `;
        }

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Error importing ${prof.email}: ${error.message}`);
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
    console.error('Import professors error:', error);
    return NextResponse.json(
      { error: 'Failed to import professors', details: error.message },
      { status: 500 }
    );
  }
}
