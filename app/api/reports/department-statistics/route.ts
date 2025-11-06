import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Simple hardcoded data for testing
    const statistics = [
      {
        department: 'Economics',
        professorCount: 5,
        moduleCount: 12,
        activeModuleCount: 10,
        preferenceCount: 15,
        activeProfessors: 4
      },
      {
        department: 'Finance',
        professorCount: 3,
        moduleCount: 8,
        activeModuleCount: 7,
        preferenceCount: 10,
        activeProfessors: 3
      },
      {
        department: 'Management',
        professorCount: 4,
        moduleCount: 10,
        activeModuleCount: 9,
        preferenceCount: 12,
        activeProfessors: 4
      }
    ];

    console.log('Department statistics (hardcoded):', statistics);
    return NextResponse.json({ data: statistics }, { status: 200 });
  } catch (error: any) {
    console.error('Department statistics report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', details: error.message },
      { status: 500 }
    );
  }
}
