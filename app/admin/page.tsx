'use client';

import { useState, useEffect } from 'react';
import { Users, BookOpen, CheckCircle, Clock, TrendingUp, BarChart3, PieChart, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Statistics {
  overview: {
    totalProfessors: number;
    totalModules: number;
    activeModules: number;
    totalPreferences: number;
  };
  activeYear: { id: number; year_name: string } | null;
  preferencesByType: { type: string; count: number }[];
  topModules: { id: number; name: string; requestCount: number }[];
  professorsByDepartment: { department: string; count: number }[];
  recentActivity: { date: string; count: number }[];
}

export default function AdminDashboardPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/admin/statistics');
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return <div>Error loading statistics</div>;
  }

  const getTeachingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'LECTURE': 'محاضرة',
      'TUTORIAL': 'أعمال موجهة',
      'BOTH': 'كلاهما'
    };
    return labels[type] || type;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {statistics.activeYear 
            ? `Academic Year: ${statistics.activeYear.year_name}` 
            : 'No active academic year'}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Professors
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {statistics.overview.totalProfessors}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Modules
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {statistics.overview.totalModules}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {statistics.overview.activeModules} active
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <BookOpen className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Preferences
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {statistics.overview.totalPreferences}
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
              <CheckCircle className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Recent Activity
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {statistics.recentActivity.reduce((sum, day) => sum + day.count, 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Last 7 days
              </p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
              <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Preferences by Teaching Type */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Preferences by Teaching Type
            </h2>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {statistics.preferencesByType.map((item) => {
              const total = statistics.preferencesByType.reduce((sum, i) => sum + i.count, 0);
              const percentage = total > 0 ? (item.count / total) * 100 : 0;
              const colors: Record<string, string> = {
                'LECTURE': 'bg-blue-500',
                'TUTORIAL': 'bg-green-500',
                'BOTH': 'bg-purple-500'
              };
              
              return (
                <div key={item.type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300" dir="rtl">
                      {getTeachingTypeLabel(item.type)}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`${colors[item.type]} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Requested Modules */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Most Requested Modules
            </h2>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {statistics.topModules.map((module, index) => {
              const maxCount = Math.max(...statistics.topModules.map(m => m.requestCount));
              const percentage = maxCount > 0 ? (module.requestCount / maxCount) * 100 : 0;
              
              return (
                <div key={module.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate flex-1">
                      #{index + 1}. {module.name}
                    </span>
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 ml-2">
                      {module.requestCount}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Professors by Department */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Professors by Department
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statistics.professorsByDepartment.map((dept, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400" dir="rtl">
                {dept.department || 'No Department'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {dept.count} Professors
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Link href="/admin/users">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-indigo-500">
            <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Manage Professors
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Add, edit, or remove professors
            </p>
          </div>
        </Link>

        <Link href="/admin/modules">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-indigo-500">
            <BookOpen className="h-8 w-8 text-green-600 dark:text-green-400 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Manage Modules
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              CRUD operations on modules
            </p>
          </div>
        </Link>

        <Link href="/admin/preferences">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-indigo-500">
            <CheckCircle className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              View Preferences
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Review professor preferences
            </p>
          </div>
        </Link>

        <Link href="/admin/academic-years">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-indigo-500">
            <Calendar className="h-8 w-8 text-orange-600 dark:text-orange-400 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Academic Years
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage academic years
            </p>
          </div>
        </Link>
      </div>

      {/* Reports Card - Featured */}
      <div className="mt-4">
        <Link href="/dashboard/reports">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-8 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-4 rounded-lg">
                  <BarChart3 className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Reports & Analytics
                  </h3>
                  <p className="text-blue-100">
                    Generate comprehensive reports with teaching load, coverage status, and department statistics
                  </p>
                </div>
              </div>
              <div className="text-white">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
