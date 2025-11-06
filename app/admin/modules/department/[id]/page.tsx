'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Edit, Trash2, ChevronRight, ArrowLeft } from 'lucide-react';

interface Specialty {
  id: number;
  name: string;
  level: string;
  department_name: string;
  modules_count: number;
}

interface Department {
  id: number;
  name: string;
}

const studyLevels = ['جذع مشترك', 'ليسانس', 'ماستر'];

export default function SpecialtiesPage() {
  const router = useRouter();
  const params = useParams();
  const departmentId = parseInt(params.id as string);

  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    level: '',
  });

  useEffect(() => {
    fetchSpecialties();
  }, [departmentId]);

  const fetchSpecialties = async () => {
    try {
      const response = await fetch(`/api/admin/specialties?departmentId=${departmentId}`);
      const data = await response.json();
      setSpecialties(data.specialties || []);
      
      if (data.specialties.length > 0) {
        setDepartment({
          id: departmentId,
          name: data.specialties[0].department_name,
        });
      }
    } catch (error) {
      console.error('Error fetching specialties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingSpecialty
        ? `/api/admin/specialties/${editingSpecialty.id}`
        : '/api/admin/specialties';
      
      const method = editingSpecialty ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          departmentId,
        }),
      });

      if (response.ok) {
        await fetchSpecialties();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving specialty:', error);
    }
  };

  const handleEdit = (specialty: Specialty) => {
    setEditingSpecialty(specialty);
    setFormData({
      name: specialty.name,
      level: specialty.level,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this specialty? This will also delete all associated modules.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/specialties/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchSpecialties();
      }
    } catch (error) {
      console.error('Error deleting specialty:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSpecialty(null);
    setFormData({
      name: '',
      level: '',
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      {/* Header with Back Button */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/admin/modules')}
          className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Departments</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" dir="rtl">
              {department?.name}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage specialties for this department
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Specialty</span>
          </button>
        </div>
      </div>

      {/* Specialties Grid */}
      {specialties.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-500 dark:text-gray-400">
            No specialties found. Click "Add New Specialty" to create one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialties.map((specialty) => (
            <div
              key={specialty.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2" dir="rtl">
                    {specialty.name}
                  </h3>
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" dir="rtl">
                    {specialty.level}
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {specialty.modules_count} {specialty.modules_count === 1 ? 'Module' : 'Modules'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => router.push(`/admin/modules/specialty/${specialty.id}`)}
                  className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium"
                >
                  <span>View Modules</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(specialty)}
                    className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(specialty.id)}
                    className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
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
                {editingSpecialty ? 'Edit Specialty' : 'Add New Specialty'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Specialty Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., علوم اقتصادية"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    dir="rtl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Study Level
                  </label>
                  <select
                    required
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
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

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {editingSpecialty ? 'Update' : 'Create'}
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
