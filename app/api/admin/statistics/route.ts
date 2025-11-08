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

async function safeQuery<T>(
  queryPromise: Promise<T>,
  fallback: T,
  context: string
): Promise<T> {
  try {
    return await queryPromise;
  } catch (error) {
    console.error(`[admin/statistics] ${context} query failed`, error);
    return fallback;
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total professors count
    const professorsCountResult = await safeQuery(
      sql`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE role = 'PROFESSOR'
    `,
      [] as any,
      'professorsCount'
    );

    // Get total modules count
    const modulesCountResult = await safeQuery(
      sql`
      SELECT COUNT(*) as count 
      FROM modules
    `,
      [] as any,
      'modulesCount'
    );

    // Get active modules count
    const activeModulesCountResult = await safeQuery(
      sql`
      SELECT COUNT(*) as count 
      FROM modules 
      WHERE is_active_for_current_year = true
    `,
      [] as any,
      'activeModulesCount'
    );

    // Get preferences count by status
    const preferencesCountResult = await safeQuery(
      sql`
      SELECT COUNT(*) as count 
      FROM preferences
    `,
      [] as any,
      'preferencesCount'
    );

    // Get active academic year
    const activeYearResult = await safeQuery(
      sql`
      SELECT id, year_name 
      FROM academic_years 
      WHERE is_active = true 
      LIMIT 1
    `,
      [] as any,
      'activeYear'
    );

    // Get preferences by teaching type
    const preferencesByTypeResult = await safeQuery(
      sql`
      SELECT 
        teaching_type,
        COUNT(*) as count
      FROM preferences
      GROUP BY teaching_type
    `,
      [] as any,
      'preferencesByType'
    );

    // Get top 5 most requested modules
    const topModulesResult = await safeQuery(
      sql`
      SELECT 
        m.module_name,
        m.id,
        COUNT(p.id) as request_count
      FROM modules m
      LEFT JOIN preferences p ON m.id = p.module_id
      GROUP BY m.id, m.module_name
      ORDER BY request_count DESC
      LIMIT 5
    `,
      [] as any,
      'topModules'
    );

    // Get professors by department
    const professorsByDeptResult = await safeQuery(
      sql`
      SELECT 
        department,
        COUNT(*) as count
      FROM professors
      GROUP BY department
    `,
      [] as any,
      'professorsByDept'
    );

    // Get preferences activity over time (last 7 days)
    const recentActivityResult = await safeQuery(
      sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM preferences
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `,
      [] as any,
      'recentActivity'
    );

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
