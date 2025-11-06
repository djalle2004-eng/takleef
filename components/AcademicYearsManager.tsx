'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Archive, ChevronDown, ChevronRight, BookOpen } from 'lucide-react';

interface AcademicYear {
  id: number;
  year_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_archived?: boolean;
}

interface Semester {
  id: number;
  semester_name: string;
  semester_number: number;
  academic_year_id: number;
  start_date: string;
  end_date: string;
}

interface Module {
  id: number;
  module_name: string;
}

export default function AcademicYearsManager() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Record<number, Semester[]>>({});
  const [modules, setModules] = useState<Record<number, Module[]>>({});
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [formData, setFormData] = useState({
    yearName: '',
    startDate: '',
    endDate: '',
    isActive: false,
  });

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      const response = await fetch('/api/admin/academic-years');
      const data = await response.json();
      setAcademicYears(data.academicYears || []);
    } catch (error) {
      console.error('Error fetching academic years:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSemestersForYear = async (yearId: number) => {
    try {
      const response = await fetch(`/api/admin/semesters?academicYearId=${yearId}`);
      const data = await response.json();
      setSemesters(prev => ({ ...prev, [yearId]: data.semesters || [] }));
      
      // Fetch modules for each semester
      for (const semester of data.semesters || []) {
        fetchModulesForSemester(semester.id);
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
    }
  };

  const fetchModulesForSemester = async (semesterId: number) => {
    try {
      const response = await fetch(`/api/admin/modules`);
      const data = await response.json();
      const semesterModules = (data.modules || []).filter((m: any) => m.semester_id === semesterId);
      setModules(prev => ({ ...prev, [semesterId]: semesterModules }));
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const toggleYear = async (yearId: number) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(yearId)) {
      newExpanded.delete(yearId);
    } else {
      newExpanded.add(yearId);
      // Fetch semesters if not already loaded
      if (!semesters[yearId]) {
        await fetchSemestersForYear(yearId);
      }
    }
    setExpandedYears(newExpanded);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingYear
        ? `/api/admin/academic-years/${editingYear.id}`
        : '/api/admin/academic-years';
      
      const method = editingYear ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchAcademicYears();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving academic year:', error);
    }
  };

  const handleEdit = (year: AcademicYear) => {
    setEditingYear(year);
    setFormData({
      yearName: year.year_name,
      startDate: year.start_date.split('T')[0],
      endDate: year.end_date.split('T')[0],
      isActive: year.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this academic year?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/academic-years/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchAcademicYears();
      }
    } catch (error) {
      console.error('Error deleting academic year:', error);
    }
  };

  const handleArchive = async (id: number, isArchived: boolean) => {
    try {
      const response = await fetch(`/api/admin/academic-years/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: !isArchived }),
      });

      if (response.ok) {
        await fetchAcademicYears();
      }
    } catch (error) {
      console.error('Error archiving academic year:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingYear(null);
    setFormData({
      yearName: '',
      startDate: '',
      endDate: '',
      isActive: false,
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Academic Year Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage academic years and their schedules
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Year</span>
        </button>
      </div>

      {/* Academic Years Table */}
      <div className="rounded-lg bg-white shadow dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Year Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {academicYears.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No academic years found. Click "Add New Year" to create one.
                  </td>
                </tr>
              ) : (
                academicYears.map((year) => (
                  <React.Fragment key={year.id}>
                    <tr className={year.is_archived ? 'opacity-60' : ''}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        <button
                          onClick={() => toggleYear(year.id)}
                          className="flex items-center space-x-2 hover:text-indigo-600"
                        >
                          {expandedYears.has(year.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <span>{year.year_name}</span>
                        </button>
                        {year.is_archived && (
                          <span className="ml-6 text-xs text-gray-500">(Archived)</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(year.start_date).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(year.end_date).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            year.is_active
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {year.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-3">
                        <button
                          onClick={() => handleEdit(year)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 inline-flex items-center"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleArchive(year.id, year.is_archived || false)}
                          className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 inline-flex items-center"
                        >
                          <Archive className="h-4 w-4 mr-1" />
                          {year.is_archived ? 'Unarchive' : 'Archive'}
                        </button>
                        <button
                          onClick={() => handleDelete(year.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 inline-flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Semesters */}
                    {expandedYears.has(year.id) && semesters[year.id] && (
                      <tr>
                        <td colSpan={5} className="px-0 py-0 bg-gray-50 dark:bg-gray-900/50">
                          <div className="px-12 py-4 space-y-3">
                            {semesters[year.id].map((semester) => (
                              <div key={semester.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {semester.semester_name}
                                  </h4>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(semester.start_date).toLocaleDateString()} - {new Date(semester.end_date).toLocaleDateString()}
                                  </span>
                                </div>
                                
                                {/* Modules for this semester */}
                                <div className="mt-2 space-y-1">
                                  {modules[semester.id] && modules[semester.id].length > 0 ? (
                                    modules[semester.id].map((module) => (
                                      <div key={module.id} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 pl-4">
                                        <BookOpen className="h-3 w-3" />
                                        <span>{module.module_name}</span>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-500 italic pl-4">
                                      No modules assigned yet
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={handleCloseModal}></div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {editingYear ? 'Edit Academic Year' : 'Add New Academic Year'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Year Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.yearName}
                    onChange={(e) => setFormData({ ...formData, yearName: e.target.value })}
                    placeholder="e.g., 2025-2026"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
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
                    Set as active year
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {editingYear ? 'Update' : 'Create'}
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
