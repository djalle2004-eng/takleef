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
    const data = [
      {
        module_id: 1,
        module_name: 'Mathematics I',
        study_level: 'License',
        semester: 1,
        specialty_name: 'Economics',
        department_name: 'Economics',
        is_active_for_current_year: true,
        professor_count: 3
      },
      {
        module_id: 2,
        module_name: 'Statistics',
        study_level: 'License',
        semester: 2,
        specialty_name: 'Economics',
        department_name: 'Economics',
        is_active_for_current_year: true,
        professor_count: 2
      },
      {
        module_id: 3,
        module_name: 'Financial Analysis',
        study_level: 'Master',
        semester: 1,
        specialty_name: 'Finance',
        department_name: 'Finance',
        is_active_for_current_year: true,
        professor_count: 0
      },
      {
        module_id: 4,
        module_name: 'Management Theory',
        study_level: 'License',
        semester: 1,
        specialty_name: 'Management',
        department_name: 'Management',
        is_active_for_current_year: true,
        professor_count: 2
      }
    ];

    // Calculate coverage statistics
    const totalModules = data.length;
    const coveredModules = data.filter((r: any) => parseInt(r.professor_count) > 0).length;
    const uncoveredModules = totalModules - coveredModules;
    const coveragePercentage = totalModules > 0 ? (coveredModules / totalModules * 100).toFixed(1) : 0;

    console.log('Subject coverage (hardcoded):', { totalModules, coveredModules, uncoveredModules });

    return NextResponse.json({ 
      data: data,
      summary: {
        totalModules,
        coveredModules,
        uncoveredModules,
        coveragePercentage
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('Subject coverage report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', details: error.message },
      { status: 500 }
    );
  }
}
