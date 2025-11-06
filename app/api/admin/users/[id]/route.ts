import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { sql } from '@/lib/db';

// GET - Get single user details
export async function GET(
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
      SELECT 
        u.id, 
        u.email, 
        u.role, 
        u.is_active,
        u.created_at,
        p.full_name_latin,
        p.full_name_arabic,
        p.academic_rank,
        p.professional_email,
        p.personal_email,
        p.primary_phone,
        p.secondary_phone,
        p.phd_specialization,
        p.field_of_research,
        p.department
      FROM users u
      LEFT JOIN professors p ON u.id = p.user_id
      WHERE u.id = ${id}
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: result[0] }, { status: 200 });
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id);
    const body = await request.json();

    // Update user table
    if (body.email || body.role !== undefined || body.isActive !== undefined) {
      await sql`
        UPDATE users
        SET 
          email = COALESCE(${body.email}, email),
          role = COALESCE(${body.role}, role),
          is_active = COALESCE(${body.isActive}, is_active),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `;
    }

    // Update professor profile if provided
    if (body.profile) {
      const profile = body.profile;
      
      // Check if professor profile exists
      const existingProfile = await sql`
        SELECT id FROM professors WHERE user_id = ${id}
      `;

      if (existingProfile.length > 0) {
        // Update existing profile
        await sql`
          UPDATE professors
          SET 
            full_name_latin = COALESCE(${profile.fullNameLatin}, full_name_latin),
            full_name_arabic = COALESCE(${profile.fullNameArabic}, full_name_arabic),
            academic_rank = COALESCE(${profile.academicRank}, academic_rank),
            professional_email = COALESCE(${profile.professionalEmail}, professional_email),
            personal_email = COALESCE(${profile.personalEmail}, personal_email),
            primary_phone = COALESCE(${profile.primaryPhone}, primary_phone),
            secondary_phone = COALESCE(${profile.secondaryPhone}, secondary_phone),
            phd_specialization = COALESCE(${profile.phdSpecialization}, phd_specialization),
            field_of_research = COALESCE(${profile.fieldOfResearch}, field_of_research),
            department = COALESCE(${profile.department}, department),
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ${id}
        `;
      }
    }

    return NextResponse.json(
      { success: true, message: 'User updated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Toggle user active status
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

    const result = await sql`
      UPDATE users
      SET 
        is_active = ${body.isActive},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, user: result[0] },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Toggle user status error:', error);
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
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

    // Check if user is admin
    const targetUser = await sql`
      SELECT role FROM users WHERE id = ${id}
    `;

    if (targetUser.length > 0 && targetUser[0].role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot delete admin users' },
        { status: 403 }
      );
    }

    const result = await sql`
      DELETE FROM users
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
