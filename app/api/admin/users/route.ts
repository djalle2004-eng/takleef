import { NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { sql } from '@/lib/db';

// GET - List all users
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await sql`
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
      ORDER BY u.created_at DESC
    `;

    return NextResponse.json({ users }, { status: 200 });
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
