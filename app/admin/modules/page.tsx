'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, BookOpen } from 'lucide-react';

interface Department {
  id: number;
  name: string;
  specialties_count: number;
}

export default function DepartmentsPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/admin/departments');
      const data = await response.json();
      setDepartments(data.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Modules Management
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Select a department to manage its specialties and modules
        </p>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((department) => (
          <div
            key={department.id}
            onClick={() => router.push(`/admin/modules/department/${department.id}`)}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-600"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-lg">
                    <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2" dir="rtl">
                  {department.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {department.specialties_count} {department.specialties_count === 1 ? 'Specialty' : 'Specialties'}
                </p>
              </div>
              <ChevronRight className="h-6 w-6 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
