'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Edit, Trash2, ArrowLeft, ToggleLeft, ToggleRight } from 'lucide-react';

interface Module {
  id: number;
  module_name: string;
  study_level: string;
  semester: string;
  is_active_for_current_year: boolean;
  specialty_name?: string;
}

const studyLevels = ['جذع مشترك', 'ليسانس', 'ماستر'];
const semesters = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];

export default function ModulesBySpecialtyPage() {
  const router = useRouter();
  const params = useParams();
  const specialtyId = parseInt(params.id as string);

  const [modules, setModules] = useState<Module[]>([]);
  const [specialty, setSpecialty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState({
    moduleName: '',
    studyLevel: '',
    semester: '',
    isActive: true,
  });

  useEffect(() => {
    fetchModules();
    fetchSpecialtyInfo();
  }, [specialtyId]);

  const fetchModules = async () => {
    try {
      const response = await fetch(`/api/admin/modules?specialtyId=${specialtyId}`);
      const data = await response.json();
      setModules(data.modules || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialtyInfo = async () => {
    try {
      const response = await fetch(`/api/admin/specialties`);
      const data = await response.json();
      const spec = data.specialties?.find((s: any) => s.id === specialtyId);
      setSpecialty(spec);
    } catch (error) {
      console.error('Error fetching specialty:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingModule
        ? `/api/admin/modules/${editingModule.id}`
        : '/api/admin/modules';
      
      const method = editingModule ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          specialtyId,
        }),
      });

      if (response.ok) {
        await fetchModules();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving module:', error);
    }
  };

  const handleEdit = (module: Module) => {
    setEditingModule(module);
    setFormData({
      moduleName: module.module_name,
      studyLevel: module.study_level,
      semester: module.semester || '',
      isActive: module.is_active_for_current_year,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this module?')) return;

    try {
      const response = await fetch(`/api/admin/modules/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchModules();
      }
    } catch (error) {
      console.error('Error deleting module:', error);
    }
  };

  const toggleActive = async (module: Module) => {
    try {
      const response = await fetch(`/api/admin/modules/${module.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleName: module.module_name,
          studyLevel: module.study_level,
          semester: module.semester,
          specialtyId,
          isActive: !module.is_active_for_current_year,
        }),
      });

      if (response.ok) {
        await fetchModules();
      }
    } catch (error) {
      console.error('Error toggling module status:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingModule(null);
    setFormData({
      moduleName: '',
      studyLevel: '',
      semester: '',
      isActive: true,
    });
  };

  // Group modules by semester
  const groupedModules = modules.reduce((acc: Record<string, Module[]>, module) => {
    const semester = module.semester || 'Unassigned';
    if (!acc[semester]) acc[semester] = [];
    acc[semester].push(module);
    return acc;
  }, {});

  const semesters = Object.keys(groupedModules).sort();

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => specialty && router.push(`/admin/modules/department/${specialty.department_id || 1}`)}
          className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Specialties</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" dir="rtl">
              {specialty?.name}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Level: <span dir="rtl" className="font-medium">{specialty?.level}</span>
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Module</span>
          </button>
        </div>
      </div>

      {/* Modules Grouped by Semester */}
      {semesters.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-500 dark:text-gray-400">
            No modules found. Click "Add New Module" to create one.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {semesters.map((semester) => (
            <div key={semester} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {semester === 'Unassigned' ? 'Unassigned Modules' : `${semester} Modules`}
              </h2>
              
              <div className="space-y-3">
                {groupedModules[semester].map((module) => (
                  <div
                    key={module.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white" dir="rtl">
                        {module.module_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1" dir="rtl">
                        {module.study_level}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleActive(module)}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                          module.is_active_for_current_year
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                        }`}
                        title={module.is_active_for_current_year ? 'Active' : 'Inactive'}
                      >
                        {module.is_active_for_current_year ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                        <span>{module.is_active_for_current_year ? 'Active' : 'Inactive'}</span>
                      </button>
                      
                      <button
                        onClick={() => handleEdit(module)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 p-2"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(module.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={handleCloseModal}></div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {editingModule ? 'Edit Module' : 'Add New Module'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Module Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.moduleName}
                    onChange={(e) => setFormData({ ...formData, moduleName: e.target.value })}
                    placeholder="e.g., Microéconomie"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Study Level
                  </label>
                  <select
                    required
                    value={formData.studyLevel}
                    onChange={(e) => setFormData({ ...formData, studyLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    dir="rtl"
                  >
                    <option value="">Select Level</option>
                    {studyLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Semester
                  </label>
                  <select
                    required
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">-- Select Semester --</option>
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="S3">S3</option>
                    <option value="S4">S4</option>
                    <option value="S5">S5</option>
                    <option value="S6">S6</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Active for current academic year
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {editingModule ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
