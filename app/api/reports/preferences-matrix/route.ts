import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get('academicYearId');
    const department = searchParams.get('department');
    const moduleId = searchParams.get('moduleId');

    console.log('📊 Preferences Matrix API Called:', { 
      academicYearId, 
      academicYearIdType: typeof academicYearId,
      department,
      moduleId,
      userId: user.userId,
      userRole: user.role
    });

    // Start with queries
    let professors: any[] = [];
    let modules: any[] = [];
    let preferences: any[] = [];

    try {
      // Get ALL professors (no department filter on professors)
      // Professors can teach modules in different departments
      const professorsResult = await sql`
        SELECT 
          u.id as professor_id,
          p.full_name_latin,
          p.full_name_arabic,
          p.academic_rank,
          p.department
        FROM users u
        JOIN professors p ON u.id = p.user_id
        WHERE u.role = 'PROFESSOR'
        ORDER BY p.department, p.full_name_latin
      `;
      
      professors = Array.isArray(professorsResult) ? professorsResult : (professorsResult as any).rows || [];
      console.log('👥 All professors fetched:', professors.length);

    } catch (profError) {
      console.error('❌ Error fetching professors:', profError);
      professors = [];
    }

    try {
      // Get modules with DEPARTMENT FILTER and optional MODULE FILTER
      let modulesResult;
      
      if (moduleId && moduleId !== '') {
        // Fetch only the selected module
        console.log(`📚 Fetching specific module: ${moduleId}`);
        modulesResult = await sql`
          SELECT 
            m.id as module_id,
            m.module_name,
            m.study_level,
            m.semester,
            s.name as specialty_name,
            d.name as department_name
          FROM modules m
          LEFT JOIN specialties s ON m.specialty_id = s.id
          LEFT JOIN departments d ON s.department_id = d.id
          WHERE m.is_active_for_current_year = true AND m.id = ${parseInt(moduleId)}
        `;
      } else if (department && department !== 'all') {
        console.log(`📚 Filtering modules by department: ${department}`);
        modulesResult = await sql`
          SELECT 
            m.id as module_id,
            m.module_name,
            m.study_level,
            m.semester,
            s.name as specialty_name,
            d.name as department_name
          FROM modules m
          LEFT JOIN specialties s ON m.specialty_id = s.id
          LEFT JOIN departments d ON s.department_id = d.id
          WHERE m.is_active_for_current_year = true AND d.name = ${department}
          ORDER BY d.name, m.semester, m.module_name
        `;
      } else {
        console.log('📚 Fetching ALL active modules (no filters)');
        modulesResult = await sql`
          SELECT 
            m.id as module_id,
            m.module_name,
            m.study_level,
            m.semester,
            s.name as specialty_name,
            d.name as department_name
          FROM modules m
          LEFT JOIN specialties s ON m.specialty_id = s.id
          LEFT JOIN departments d ON s.department_id = d.id
          WHERE m.is_active_for_current_year = true
          ORDER BY d.name, m.semester, m.module_name
        `;
      }
      
      modules = Array.isArray(modulesResult) ? modulesResult : (modulesResult as any).rows || [];
      console.log(`✅ Modules fetched: ${modules.length}${moduleId ? ` (specific module ${moduleId})` : department && department !== 'all' ? ` (filtered by ${department})` : ' (all departments)'}`);

    } catch (modError) {
      console.error('❌ Error fetching modules:', modError);
      modules = [];
    }

    try {
      // Get preferences with optional academic year filter
      let preferencesResult;
      if (academicYearId && academicYearId !== 'all') {
        console.log(`🔍 Fetching preferences for academic_year_id = ${academicYearId}`);
        preferencesResult = await sql`
          SELECT 
            pref.id,
            pref.professor_id,
            pref.module_id,
            pref.academic_year_id,
            pref.teaching_type,
            pref.priority as priority_level,
            pref.has_taught_before,
            pref.years_experience
          FROM preferences pref
          WHERE pref.academic_year_id = ${parseInt(academicYearId)}
        `;
        console.log(`✅ Found ${Array.isArray(preferencesResult) ? preferencesResult.length : ((preferencesResult as any).rows?.length || 0)} preferences for year ${academicYearId}`);
      } else {
        console.log('🔍 Fetching ALL preferences (no year filter)');
        preferencesResult = await sql`
          SELECT 
            pref.id,
            pref.professor_id,
            pref.module_id,
            pref.academic_year_id,
            pref.teaching_type,
            pref.priority as priority_level,
            pref.has_taught_before,
            pref.years_experience
          FROM preferences pref
        `;
        console.log(`✅ Found total ${Array.isArray(preferencesResult) ? preferencesResult.length : ((preferencesResult as any).rows?.length || 0)} preferences in database`);
      }
      
      preferences = Array.isArray(preferencesResult) ? preferencesResult : (preferencesResult as any).rows || [];
      console.log(`📋 Preferences after processing: ${preferences.length}`);
      if (preferences.length > 0) {
        console.log('📋 Sample preference:', preferences[0]);
        console.log('📋 Academic years in preferences:', Array.from(new Set(preferences.map(p => p.academic_year_id))));
      }

    } catch (prefError) {
      console.error('❌ Error fetching preferences:', prefError);
      preferences = [];
    }

    // Log if no data found
    if (professors.length === 0) {
      console.warn('⚠️ No professors found in database');
    }
    if (modules.length === 0) {
      console.warn('⚠️ No active modules found in database');
    }
    if (preferences.length === 0) {
      console.warn('⚠️ No preferences found in database');
    }

    // Build matrix with error handling
    const matrix = professors.map((prof: any) => {
      const professorPreferences = preferences.filter((pref: any) => 
        pref.professor_id === prof.professor_id
      );
      
      const modulePreferences = modules.map((module: any) => {
        const pref = professorPreferences.find((p: any) => 
          p.module_id === module.module_id
        );
        
        const hasTaughtBefore = pref?.has_taught_before ?? false;
        const yearsExperience = hasTaughtBefore ? pref?.years_experience ?? 0 : 0;

        return {
          module_id: module.module_id,
          module_name: module.module_name || 'Unknown Module',
          has_preference: !!pref,
          teaching_type: pref?.teaching_type || null,
          priority_level: pref?.priority_level || null,
          has_taught_before: hasTaughtBefore,
          years_experience: yearsExperience,
          display_text: pref
            ? `${pref.teaching_type} (P${pref.priority_level})${hasTaughtBefore ? ` • EXP ${yearsExperience || 0}y` : ''}`
            : '-'
        };
      });

      return {
        professor_id: prof.professor_id,
        professor_name: prof.full_name_latin || 'Unknown Professor',
        professor_name_arabic: prof.full_name_arabic || '',
        academic_rank: prof.academic_rank || 'Professor',
        department: prof.department || 'General',
        preferences: modulePreferences,
        total_preferences: professorPreferences.length
      };
    });

    console.log('Matrix built successfully:', {
      professorsCount: professors.length,
      modulesCount: modules.length,
      preferencesCount: preferences.length,
      matrixSize: matrix.length
    });

    return NextResponse.json({ 
      data: {
        matrix,
        professors,
        modules,
        summary: {
          totalProfessors: professors.length,
          totalModules: modules.length,
          totalPreferences: preferences.length
        }
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Preferences matrix report error:', error);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate preferences matrix', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}
