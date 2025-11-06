import { NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total professors count
    const professorsCount = await sql`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE role = 'PROFESSOR'
    `;

    // Get total modules count
    const modulesCount = await sql`
      SELECT COUNT(*) as count 
      FROM modules
    `;

    // Get active modules count
    const activeModulesCount = await sql`
      SELECT COUNT(*) as count 
      FROM modules 
      WHERE is_active_for_current_year = true
    `;

    // Get preferences count by status
    const preferencesCount = await sql`
      SELECT COUNT(*) as count 
      FROM preferences
    `;

    // Get active academic year
    const activeYear = await sql`
      SELECT id, year_name 
      FROM academic_years 
      WHERE is_active = true 
      LIMIT 1
    `;

    // Get preferences by teaching type
    const preferencesByType = await sql`
      SELECT 
        teaching_type,
        COUNT(*) as count
      FROM preferences
      GROUP BY teaching_type
    `;

    // Get top 5 most requested modules
    const topModules = await sql`
      SELECT 
        m.module_name,
        m.id,
        COUNT(p.id) as request_count
      FROM modules m
      LEFT JOIN preferences p ON m.id = p.module_id
      GROUP BY m.id, m.module_name
      ORDER BY request_count DESC
      LIMIT 5
    `;

    // Get professors by department
    const professorsByDept = await sql`
      SELECT 
        department,
        COUNT(*) as count
      FROM professors
      GROUP BY department
      ORDER BY count DESC
    `;

    // Get preferences activity over time (last 7 days)
    const recentActivity = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM preferences
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    const statistics = {
      overview: {
        totalProfessors: parseInt(professorsCount[0]?.count || '0'),
        totalModules: parseInt(modulesCount[0]?.count || '0'),
        activeModules: parseInt(activeModulesCount[0]?.count || '0'),
        totalPreferences: parseInt(preferencesCount[0]?.count || '0'),
      },
      activeYear: activeYear[0] || null,
      preferencesByType: preferencesByType.map(row => ({
        type: row.teaching_type,
        count: parseInt(row.count)
      })),
      topModules: topModules.map(row => ({
        id: row.id,
        name: row.module_name,
        requestCount: parseInt(row.request_count)
      })),
      professorsByDepartment: professorsByDept.map(row => ({
        department: row.department,
        count: parseInt(row.count)
      })),
      recentActivity: recentActivity.map(row => ({
        date: row.date,
        count: parseInt(row.count)
      }))
    };

    return NextResponse.json(statistics, { status: 200 });
  } catch (error: any) {
    console.error('Get statistics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics', details: error.message },
      { status: 500 }
    );
  }
}
