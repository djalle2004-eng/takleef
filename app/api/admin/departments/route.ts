import { NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { sql } from '@/lib/db';

// GET - List all departments
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const departments = await sql`
      SELECT d.*, 
             COUNT(DISTINCT s.id) as specialties_count
      FROM departments d
      LEFT JOIN specialties s ON d.id = s.department_id
      GROUP BY d.id
      ORDER BY d.name
    `;

    return NextResponse.json({ departments }, { status: 200 });
  } catch (error: any) {
    console.error('Get departments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}
