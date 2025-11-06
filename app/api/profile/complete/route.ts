import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';
import { professorProfileSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate input
    const validatedData = professorProfileSchema.parse(body);
    
    // Check if profile already exists
    const existingProfile = await sql`
      SELECT id FROM professors WHERE user_id = ${user.userId}
    `;
    
    if (existingProfile.length > 0) {
      // Update existing profile
      await sql`
        UPDATE professors
        SET 
          full_name_arabic = ${validatedData.fullNameArabic},
          full_name_latin = ${validatedData.fullNameLatin},
          academic_rank = ${validatedData.academicRank},
          professional_email = ${validatedData.professionalEmail},
          personal_email = ${validatedData.personalEmail || null},
          primary_phone = ${validatedData.primaryPhone},
          secondary_phone = ${validatedData.secondaryPhone || null},
          phd_specialization = ${validatedData.phdSpecialization},
          field_of_research = ${validatedData.fieldOfResearch || null},
          department = ${validatedData.department},
          profile_completed = TRUE,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${user.userId}
      `;
    } else {
      // Create new profile
      await sql`
        INSERT INTO professors (
          user_id,
          full_name_arabic,
          full_name_latin,
          academic_rank,
          professional_email,
          personal_email,
          primary_phone,
          secondary_phone,
          phd_specialization,
          field_of_research,
          department,
          profile_completed
        ) VALUES (
          ${user.userId},
          ${validatedData.fullNameArabic},
          ${validatedData.fullNameLatin},
          ${validatedData.academicRank},
          ${validatedData.professionalEmail},
          ${validatedData.personalEmail || null},
          ${validatedData.primaryPhone},
          ${validatedData.secondaryPhone || null},
          ${validatedData.phdSpecialization},
          ${validatedData.fieldOfResearch || null},
          ${validatedData.department},
          TRUE
        )
      `;
    }
    
    return NextResponse.json(
      { success: true, message: 'Profile completed successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Profile completion error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'An error occurred saving your profile' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get professor profile
    const result = await sql`
      SELECT * FROM professors WHERE user_id = ${user.userId}
    `;
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }
    
    const profile = result[0];
    
    return NextResponse.json(
      {
        profile: {
          fullNameArabic: profile.full_name_arabic,
          fullNameLatin: profile.full_name_latin,
          academicRank: profile.academic_rank,
          professionalEmail: profile.professional_email,
          personalEmail: profile.personal_email,
          primaryPhone: profile.primary_phone,
          secondaryPhone: profile.secondary_phone,
          phdSpecialization: profile.phd_specialization,
          fieldOfResearch: profile.field_of_research,
          department: profile.department,
          profileCompleted: profile.profile_completed,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get profile error:', error);
    
    return NextResponse.json(
      { error: 'An error occurred fetching profile' },
      { status: 500 }
    );
  }
}
