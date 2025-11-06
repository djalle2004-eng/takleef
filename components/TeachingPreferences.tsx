'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Check, X, ArrowLeftRight, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

const studyLevels = ['جذع مشترك', 'ليسانس', 'ماستر'];
const teachingTypes = [
  { value: 'LECTURE', label: 'محاضرة فقط' },
  { value: 'TUTORIAL', label: 'أعمال موجهة فقط' },
  { value: 'BOTH', label: 'كلاهما معًا' },
];

interface AcademicYear {
  id: number;
  year_name: string;
  is_active: boolean;
}

interface Specialty {
  id: number;
  name: string;
  level: string;
}

interface Module {
  id: number;
  module_name: string;
  semester: string;
  specialty_id: number;
  is_active_for_current_year?: boolean;
}

interface Preference {
  id: number;
  module_id: number;
  module_name: string;
  specialty_name: string;
  semester: string;
  priority: number;
  teaching_type: string;
  has_taught_before?: boolean;
  years_experience?: number;
}

export default function TeachingPreferences() {
  const router = useRouter();
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [preferences, setPreferences] = useState<Preference[]>([]);
  
  const [selectedLevel, setSelectedLevel] = useState('');
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [priority, setPriority] = useState('');
  const [teachingType, setTeachingType] = useState('');
  const [hasTaughtBefore, setHasTaughtBefore] = useState(false);
  const [yearsExperience, setYearsExperience] = useState('');
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    fetchAcademicYears();
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      // This will be from the current user session
      // For now, we'll check if they can access admin routes
      setUserRole('ADMIN'); // You can fetch this from an API endpoint
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  useEffect(() => {
    if (selectedYear) {
      fetchPreferences();
    }
  }, [selectedYear]);

  useEffect(() => {
    if (selectedLevel) {
      fetchSpecialties();
    }
  }, [selectedLevel]);

  useEffect(() => {
    if (selectedSpecialty) {
      fetchModules();
    }
  }, [selectedSpecialty]);

  const fetchAcademicYears = async () => {
    try {
      const response = await fetch('/api/academic-years');
      const data = await response.json();
      setAcademicYears(data.academicYears || []);
      
      // Auto-select active year
      const activeYear = data.academicYears?.find((y: AcademicYear) => y.is_active);
      if (activeYear) setSelectedYear(activeYear.id);
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await fetch(`/api/preferences?academicYearId=${selectedYear}`);
      const data = await response.json();
      setPreferences(data.preferences || []);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await fetch('/api/specialties');
      const data = await response.json();
      const filtered = (data.specialties || []).filter((s: Specialty) => s.level === selectedLevel);
      setSpecialties(filtered);
    } catch (error) {
      console.error('Error fetching specialties:', error);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch(`/api/modules?specialtyId=${selectedSpecialty}`);
      const data = await response.json();
      const activeModules = (data.modules || []).filter((m: Module) => m.is_active_for_current_year);
      setModules(activeModules);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const handleOpenAdd = (module: Module) => {
    setSelectedModule(module);
    setPriority('');
    setTeachingType('');
    setHasTaughtBefore(false);
    setYearsExperience('');
    setShowAddModal(true);
  };

  const handleAddPreference = async () => {
    if (!selectedYear || !selectedModule || !priority || !teachingType) {
      alert('Please fill all fields');
      return;
    }

    const priorityNum = parseInt(priority);
    if (preferences.some(p => p.priority === priorityNum)) {
      alert(`Priority ${priorityNum} is already used. Please choose a different priority.`);
      return;
    }

    const experienceValue = hasTaughtBefore ? parseInt(yearsExperience || '0') : 0;

    if (hasTaughtBefore && (isNaN(experienceValue) || experienceValue <= 0)) {
      alert('Please enter the number of years you have taught this module before.');
      return;
    }

    if (!hasTaughtBefore) {
      setYearsExperience('');
    }

    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: selectedModule.id,
          academicYearId: selectedYear,
          priority: priorityNum,
          teachingType,
          hasTaughtBefore,
          yearsExperience: experienceValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to add preference');
        return;
      }

      await fetchPreferences();
      setShowAddModal(false);
      setSelectedModule(null);
      setHasTaughtBefore(false);
      setYearsExperience('');
    } catch (error) {
      console.error('Error adding preference:', error);
      alert('Failed to add preference');
    }
  };

  const handleDeletePreference = async (preferenceId: number) => {
    if (!confirm('Are you sure you want to remove this preference?')) return;

    try {
      await fetch(`/api/preferences?id=${preferenceId}`, {
        method: 'DELETE',
      });
      await fetchPreferences();
    } catch (error) {
      console.error('Error deleting preference:', error);
    }
  };

  const getTeachingTypeLabel = (type: string) => {
    return teachingTypes.find(t => t.value === type)?.label || type;
  };

  // Group modules by semester
  const groupedModules = modules.reduce((acc: Record<string, Module[]>, module) => {
    const semester = module.semester || 'Unassigned';
    if (!acc[semester]) acc[semester] = [];
    acc[semester].push(module);
    return acc;
  }, {});

  const semesters = Object.keys(groupedModules).sort();

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      window.location.href = '/signin';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Top Navigation Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Teaching Preferences
          </h1>
          <div className="flex items-center space-x-3">
            {userRole === 'ADMIN' && (
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span>Switch to Admin View</span>
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Select your preferred modules with priority and teaching type
          </p>

          {/* Step 1: Select Academic Year */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Step 1: Select Academic Year
            </label>
            <select
              value={selectedYear || ''}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select Academic Year</option>
              {academicYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.year_name} {year.is_active && '(Active)'}
                </option>
              ))}
            </select>
          </div>

          {/* Current Preferences List */}
          {selectedYear && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Your Current Preferences
              </h2>
              {preferences.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">
                    No preferences added yet. Start by selecting modules below.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {preferences.map((pref) => (
                    <div
                      key={pref.id}
                      className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="bg-indigo-600 text-white font-bold px-3 py-1 rounded-full text-sm">
                            #{pref.priority}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {pref.module_name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {pref.specialty_name} - {pref.semester}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium" dir="rtl">
                          {getTeachingTypeLabel(pref.teaching_type)}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-300" dir="rtl">
                          {pref.has_taught_before
                            ? `خبرة: ${pref.years_experience ?? 0} سنة`
                            : 'لم يدرّس هذا المقياس سابقاً'}
                        </span>
                        <button
                          onClick={() => handleDeletePreference(pref.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add New Preferences */}
          {selectedYear && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Add New Preference
              </h2>

              {/* Step 2: Select Level */}
              <div className="mb-6">
                <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Step 2: Select Study Level (طور)
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {studyLevels.map((level) => (
                    <button
                      key={level}
                      onClick={() => {
                        setSelectedLevel(level);
                        setSelectedSpecialty(null);
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedLevel === level
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                      }`}
                    >
                      <p className="font-semibold text-gray-900 dark:text-white" dir="rtl">
                        {level}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Select Specialty */}
              {selectedLevel && specialties.length > 0 && (
                <div className="mb-6">
                  <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Step 3: Select Specialty (التخصص)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {specialties.map((specialty) => (
                      <button
                        key={specialty.id}
                        onClick={() => setSelectedSpecialty(specialty.id)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          selectedSpecialty === specialty.id
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                        }`}
                      >
                        <p className="font-semibold text-gray-900 dark:text-white" dir="rtl">
                          {specialty.name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Select Modules */}
              {selectedSpecialty && modules.length > 0 && (
                <div>
                  <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Step 4: Select Module (المقياس)
                  </label>
                  <div className="space-y-4">
                    {semesters.map((semester) => (
                      <div key={semester} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                          {semester === 'Unassigned' ? 'Unassigned Modules' : `${semester} Modules`}
                        </h3>
                        <div className="space-y-2">
                          {groupedModules[semester].map((module) => {
                            const alreadySelected = preferences.some(p => p.module_id === module.id);
                            return (
                              <div
                                key={module.id}
                                className={`flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg ${
                                  alreadySelected ? 'opacity-50' : ''
                                }`}
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {module.module_name}
                                  </p>
                                </div>
                                {alreadySelected ? (
                                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                    <Check className="h-4 w-4 mr-1" />
                                    Already Added
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleOpenAdd(module)}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg flex items-center space-x-2"
                                  >
                                    <Plus className="h-4 w-4" />
                                    <span>Add</span>
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Preference Modal */}
      {showAddModal && selectedModule && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowAddModal(false)}></div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Add Module Preference
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedModule.module_name}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    placeholder="Enter priority (1, 2, 3...)"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Lower numbers = higher priority
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teaching Type (نوع التدريس)
                  </label>
                  <div className="space-y-2">
                    {teachingTypes.map((type) => (
                      <label
                        key={type.value}
                        className="flex items-center p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <input
                          type="radio"
                          name="teachingType"
                          value={type.value}
                          checked={teachingType === type.value}
                          onChange={(e) => setTeachingType(e.target.value)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-3 text-gray-900 dark:text-white" dir="rtl">
                          {type.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    هل درّست هذا المقياس من قبل؟
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={hasTaughtBefore}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setHasTaughtBefore(checked);
                        if (!checked) {
                          setYearsExperience('');
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      نعم، لدي خبرة سابقة مع هذا المقياس
                    </span>
                  </div>
                </div>

                {hasTaughtBefore && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      عدد سنوات الخبرة
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value)}
                      placeholder="أدخل عدد السنوات"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      الرجاء إدخال عدد السنوات التي درّست خلالها هذا المقياس سابقاً.
                    </p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleAddPreference}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Confirm & Add
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
