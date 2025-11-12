'use client';

import { useState, useEffect } from 'react';
import { Download, ChevronRight, Users, BookOpen } from 'lucide-react';
import * as XLSX from 'xlsx';

interface AcademicYear {
  id: number;
  year_name: string;
  is_active: boolean;
}

interface Preference {
  id: number;
  professor_id: number;
  module_id: number;
  full_name_latin: string;
  full_name_arabic: string;
  email: string;
  academic_rank: string;
  department: string;
  module_name: string;
  specialty_name: string;
  specialty_level?: string;
  specialty_department?: string;
  semester?: string | null;
  year_name: string;
  priority: number;
  teaching_type: string;
  has_taught_before?: boolean;
  years_experience?: number | null;
}

const teachingTypeLabels: Record<string, string> = {
  'LECTURE': 'محاضرة فقط',
  'TUTORIAL': 'أعمال موجهة فقط',
  'BOTH': 'كلاهما معًا',
};

type TabType = 'professor' | 'module';

export default function AdminPreferencesPage() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('professor');
  const [selectedProfessor, setSelectedProfessor] = useState<number | null>(null);
  const [selectedModule, setSelectedModule] = useState<number | null>(null);

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchPreferences();
    }
  }, [selectedYear]);

  const fetchAcademicYears = async () => {
    try {
      const response = await fetch('/api/admin/academic-years');
      const data = await response.json();
      setAcademicYears(data.academicYears || []);
      
      // Auto-select active year
      const activeYear = data.academicYears?.find((y: AcademicYear) => y.is_active);
      if (activeYear) setSelectedYear(activeYear.id);
    } catch (error) {
      console.error('Error fetching academic years:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/preferences?academicYearId=${selectedYear}`);
      const data = await response.json();
      setPreferences(data.preferences || []);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group preferences by professor
  const groupedByProfessor = preferences.reduce((acc: Record<string, Preference[]>, pref) => {
    const key = pref.professor_id.toString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(pref);
    return acc;
  }, {});

  const professorsList = Object.entries(groupedByProfessor).map(([id, prefs]) => ({
    professor_id: parseInt(id),
    professor_name: prefs[0].full_name_latin,
    professor_name_ar: prefs[0].full_name_arabic,
    email: prefs[0].email,
    academic_rank: prefs[0].academic_rank,
    department: prefs[0].department,
    preferences: prefs.sort((a, b) => a.priority - b.priority),
  }));

  // Group preferences by module
  const groupedByModule = preferences.reduce((acc: Record<string, Preference[]>, pref) => {
    const key = pref.module_id.toString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(pref);
    return acc;
  }, {});

  const modulesList = Object.entries(groupedByModule).map(([id, prefs]) => ({
    module_id: parseInt(id),
    module_name: prefs[0].module_name,
    specialty_name: prefs[0].specialty_name,
    professors: prefs.sort((a, b) => a.priority - b.priority),
  }));

  // Export to Excel - By Professor
  const exportByProfessor = () => {
    const data = professorsList.flatMap((prof) =>
      prof.preferences.map((pref) => ({
        'Professor Name': prof.professor_name,
        'Arabic Name': prof.professor_name_ar || '',
        'Email': prof.email,
        'Academic Rank': prof.academic_rank || '',
        'Department': prof.department || '',
        'Priority': pref.priority,
        'Module': pref.module_name,
        'Specialty': pref.specialty_name,
        'Teaching Type': teachingTypeLabels[pref.teaching_type],
      }))
    );

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'By Professor');
    
    const yearName = academicYears.find(y => y.id === selectedYear)?.year_name || 'Unknown';
    XLSX.writeFile(wb, `Preferences_By_Professor_${yearName}.xlsx`);
  };

  // Export to Excel - By Module
  const exportByModule = () => {
    const data = modulesList.flatMap((mod) =>
      mod.professors.map((prof) => ({
        'Module': mod.module_name,
        'Specialty': mod.specialty_name,
        'Professor Name': prof.full_name_latin,
        'Arabic Name': prof.full_name_arabic || '',
        'Email': prof.email,
        'Academic Rank': prof.academic_rank || '',
        'Department': prof.department || '',
        'Priority': prof.priority,
        'Teaching Type': teachingTypeLabels[prof.teaching_type],
      }))
    );

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'By Module');
    
    const yearName = academicYears.find(y => y.id === selectedYear)?.year_name || 'Unknown';
    XLSX.writeFile(wb, `Preferences_By_Module_${yearName}.xlsx`);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          View Preferences
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View and export professor teaching preferences
        </p>
      </div>

      {/* Academic Year Selector */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Select Academic Year
        </label>
        <select
          value={selectedYear || ''}
          onChange={(e) => {
            setSelectedYear(parseInt(e.target.value));
            setSelectedProfessor(null);
            setSelectedModule(null);
          }}
          className="w-full md:w-96 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Select Academic Year</option>
          {academicYears.map((year) => (
            <option key={year.id} value={year.id}>
              {year.year_name} {year.is_active && '(Active)'}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs and Content */}
      {selectedYear && !loading && preferences.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {/* Tabs Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <button
                onClick={() => {
                  setActiveTab('professor');
                  setSelectedProfessor(null);
                  setSelectedModule(null);
                }}
                className={`px-6 py-4 font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
                  activeTab === 'professor'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Users className="h-5 w-5" />
                <span>By Professor</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('module');
                  setSelectedProfessor(null);
                  setSelectedModule(null);
                }}
                className={`px-6 py-4 font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
                  activeTab === 'module'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <BookOpen className="h-5 w-5" />
                <span>By Module</span>
              </button>
            </div>
            <button
              onClick={activeTab === 'professor' ? exportByProfessor : exportByModule}
              className="mr-6 flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export XLSX</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'professor' && (
              <div>
                {!selectedProfessor ? (
                  /* Professor List View */
                  <div className="space-y-3">
                    {professorsList.map((prof) => (
                      <button
                        key={prof.professor_id}
                        onClick={() => setSelectedProfessor(prof.professor_id)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {prof.professor_name}
                          </h3>
                          {prof.professor_name_ar && (
                            <p className="text-sm text-gray-600 dark:text-gray-400" dir="rtl">
                              {prof.professor_name_ar}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {prof.email} • {prof.academic_rank}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-semibold">
                            {prof.preferences.length} Preferences
                          </span>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Professor Detail View */
                  <div>
                    <button
                      onClick={() => setSelectedProfessor(null)}
                      className="mb-4 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center space-x-2"
                    >
                      <ChevronRight className="h-4 w-4 rotate-180" />
                      <span>Back to Professor List</span>
                    </button>
                    {(() => {
                      const prof = professorsList.find(p => p.professor_id === selectedProfessor);
                      if (!prof) return null;
                      return (
                        <div>
                          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              {prof.professor_name}
                            </h3>
                            {prof.professor_name_ar && (
                              <p className="text-gray-600 dark:text-gray-400" dir="rtl">
                                {prof.professor_name_ar}
                              </p>
                            )}
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                              {prof.email} • {prof.academic_rank}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400" dir="rtl">
                              {prof.department}
                            </p>
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                            Module Preferences (Ordered by Priority)
                          </h4>
                          <div className="space-y-3">
                            {prof.preferences.map((pref) => (
                              <div
                                key={pref.id}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                              >
                                <div className="flex items-center space-x-4">
                                  <span className="bg-indigo-600 text-white font-bold px-3 py-1 rounded-full text-sm">
                                    #{pref.priority}
                                  </span>
                                  <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                      {pref.module_name}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400" dir="rtl">
                                      {pref.specialty_name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400" dir="rtl">
                                      {pref.specialty_department} • {pref.semester || 'غير محدد'}
                                    </p>
                                  </div>
                                </div>
                                <div className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg font-medium" dir="rtl">
                                  {teachingTypeLabels[pref.teaching_type]}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'module' && (
              <div>
                {!selectedModule ? (
                  /* Module List View */
                  <div className="space-y-3">
                    {modulesList.map((mod) => (
                      <button
                        key={mod.module_id}
                        onClick={() => setSelectedModule(mod.module_id)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {mod.module_name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400" dir="rtl">
                            {mod.specialty_name}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-semibold">
                            {mod.professors.length} Professors
                          </span>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Module Detail View */
                  <div>
                    <button
                      onClick={() => setSelectedModule(null)}
                      className="mb-4 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center space-x-2"
                    >
                      <ChevronRight className="h-4 w-4 rotate-180" />
                      <span>Back to Module List</span>
                    </button>
                    {(() => {
                      const mod = modulesList.find(m => m.module_id === selectedModule);
                      if (!mod) return null;
                      return (
                        <div>
                          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              {mod.module_name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400" dir="rtl">
                              {mod.specialty_name}
                            </p>
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                            Professors Who Selected This Module
                          </h4>
                          <div className="space-y-3">
                            {mod.professors.map((prof) => (
                              <div
                                key={prof.id}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                              >
                                <div className="flex items-center space-x-4">
                                  <span className="bg-indigo-600 text-white font-bold px-3 py-1 rounded-full text-sm">
                                    #{prof.priority}
                                  </span>
                                  <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                      {prof.full_name_latin}
                                    </p>
                                    {prof.full_name_arabic && (
                                      <p className="text-sm text-gray-600 dark:text-gray-400" dir="rtl">
                                        {prof.full_name_arabic}
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {prof.email} • {prof.academic_rank}
                                    </p>
                                  </div>
                                </div>
                                <div className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg font-medium" dir="rtl">
                                  {teachingTypeLabels[prof.teaching_type]}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedYear && !loading && preferences.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-500 dark:text-gray-400">
            No preferences found for this academic year.
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      )}
    </div>
  );
}
