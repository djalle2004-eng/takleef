import { NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { sql } from '@/lib/db';

type PreferenceTypeRow = {
  teaching_type: string;
  count: string | number;
};

type ModuleRow = {
  id: number;
  module_name: string;
  request_count: string | number;
};

type DepartmentRow = {
  department: string;
  count: string | number;
};

type ActivityRow = {
  date: string;
  count: string | number;
};

function normalizeRows<T>(result: any): T[] {
  if (!result) {
    return [];
  }

  if (Array.isArray(result)) {
    return result as T[];
  }

  if (Array.isArray(result?.rows)) {
    return result.rows as T[];
  }

  return [];
}

function toNumber(value: string | number | undefined | null): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === 'number') {
    return value;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total professors count
    const professorsCountResult = await sql`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE role = 'PROFESSOR'
    `;

    // Get total modules count
    const modulesCountResult = await sql`
      SELECT COUNT(*) as count 
      FROM modules
    `;

    // Get active modules count
    const activeModulesCountResult = await sql`
      SELECT COUNT(*) as count 
      FROM modules 
      WHERE is_active_for_current_year = true
    `;

    // Get preferences count by status
    const preferencesCountResult = await sql`
      SELECT COUNT(*) as count 
      FROM preferences
    `;

    // Get active academic year
    const activeYearResult = await sql`
      SELECT id, year_name 
      FROM academic_years 
      WHERE is_active = true 
      LIMIT 1
    `;

    // Get preferences by teaching type
    const preferencesByTypeResult = await sql`
      SELECT 
        teaching_type,
        COUNT(*) as count
      FROM preferences
      GROUP BY teaching_type
    `;

    // Get top 5 most requested modules
    const topModulesResult = await sql`
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
    const professorsByDeptResult = await sql`
      SELECT 
        department,
        COUNT(*) as count
      FROM professors
      GROUP BY department
    `;

    // Get preferences activity over time (last 7 days)
    const recentActivityResult = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM preferences
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    const professorsCount = normalizeRows<{ count: string | number }>(professorsCountResult);
    const modulesCount = normalizeRows<{ count: string | number }>(modulesCountResult);
    const activeModulesCount = normalizeRows<{ count: string | number }>(activeModulesCountResult);
    const preferencesCount = normalizeRows<{ count: string | number }>(preferencesCountResult);
    const activeYear = normalizeRows<{ id: number; year_name: string }>(activeYearResult);
    const preferencesByType = normalizeRows<PreferenceTypeRow>(preferencesByTypeResult);
    const topModules = normalizeRows<ModuleRow>(topModulesResult);
    const professorsByDept = normalizeRows<DepartmentRow>(professorsByDeptResult);
    const recentActivity = normalizeRows<ActivityRow>(recentActivityResult);

    const statistics = {
      overview: {
        totalProfessors: toNumber(professorsCount[0]?.count),
        totalModules: toNumber(modulesCount[0]?.count),
        activeModules: toNumber(activeModulesCount[0]?.count),
        totalPreferences: toNumber(preferencesCount[0]?.count),
      },
      activeYear: activeYear[0] || null,
      preferencesByType: preferencesByType.map((row: PreferenceTypeRow) => ({
        type: row.teaching_type,
        count: toNumber(row.count)
      })),
      topModules: topModules.map((row: ModuleRow) => ({
        id: row.id,
        name: row.module_name,
        requestCount: toNumber(row.request_count)
      })),
      professorsByDepartment: professorsByDept.map((row: DepartmentRow) => ({
        department: row.department,
        count: toNumber(row.count)
      })),
      recentActivity: recentActivity.map((row: ActivityRow) => ({
        date: row.date,
        count: toNumber(row.count)
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
