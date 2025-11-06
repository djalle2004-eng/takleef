import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';

// GET - List all specialties (available for all authenticated users)
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const specialties = await sql`
      SELECT s.*, d.name as department_name
      FROM specialties s
      LEFT JOIN departments d ON s.department_id = d.id
      ORDER BY d.name, s.name
    `;

    return NextResponse.json({ specialties }, { status: 200 });
  } catch (error: any) {
    console.error('Get specialties error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch specialties' },
      { status: 500 }
    );
  }
}
