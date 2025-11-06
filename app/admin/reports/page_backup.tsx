'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Download, 
  Printer, 
  Mail, 
  Filter,
  BarChart3,
  Users,
  BookOpen,
  Building2,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import ProfessorSidebar from '@/components/ProfessorSidebar';

interface AcademicYear {
  id: number;
  year_name: string;
  is_active: boolean;
}

type ReportType = 'teaching-load' | 'subject-coverage' | 'department-statistics' | 'historical';

export default function ReportsPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportType>('teaching-load');
  const [department, setDepartment] = useState('');
  const [professorId, setProfessorId] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const departments = [
    'قسم العلوم الاقتصادية',
    'قسم العلوم المالية والمحاسبة',
    'قسم علوم التسيير',
    'قسم العلوم التجارية',
    'قسم الجذع المشترك'
  ];

  const reports = [
    {
      id: 'teaching-load',
      name: 'Teaching Load per Professor',
      icon: Users,
      description: 'View workload distribution across professors',
      color: 'blue'
    },
    {
      id: 'subject-coverage',
      name: 'Subject Coverage Status',
      icon: BookOpen,
      description: 'Check which modules are covered by professors',
      color: 'green'
    },
    {
      id: 'department-statistics',
      name: 'Department Statistics',
      icon: Building2,
      description: 'Compare statistics across departments',
      color: 'purple'
    },
    {
      id: 'historical',
      name: 'Historical Data Comparison',
      icon: TrendingUp,
      description: 'Compare data across academic years',
      color: 'orange'
    }
  ];

  useEffect(() => {
    fetchUserData();
    fetchAcademicYears();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUserEmail(data.user?.email || '');
        setIsAdmin(data.user?.role === 'ADMIN');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    if (selectedYear) {
      generateReport();
    }
  }, [selectedYear, selectedReport, department, professorId]);

  const fetchAcademicYears = async () => {
    try {
      const response = await fetch('/api/admin/academic-years');
      const data = await response.json();
      setAcademicYears(data.academicYears || []);
      
      const activeYear = data.academicYears?.find((y: AcademicYear) => y.is_active);
      if (activeYear) setSelectedYear(activeYear.id);
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  };

  const generateReport = async () => {
    if (selectedReport === 'historical') {
      // Skip API call for historical report (coming soon)
      setReportData({ data: [] });
      return;
    }

    setLoading(true);
    try {
      let url = `/api/reports/${selectedReport}?`;
      const params = new URLSearchParams();
      
      if (selectedYear) params.append('academicYearId', selectedYear.toString());
      if (department) params.append('department', department);
      if (professorId) params.append('professorId', professorId);

      const response = await fetch(url + params.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error('API error:', data.error);
        setReportData(null);
      } else {
        setReportData(data);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!reportData || !reportData.data) return;

    const ws = XLSX.utils.json_to_sheet(reportData.data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    
    const yearName = academicYears.find(y => y.id === selectedYear)?.year_name || 'Report';
    const fileName = `${selectedReport}_${yearName}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const exportToPDF = () => {
    window.print();
  };

  const sendByEmail = () => {
    const subject = `Report: ${reports.find(r => r.id === selectedReport)?.name}`;
    const body = `Please find the attached report for academic year ${academicYears.find(y => y.id === selectedYear)?.year_name}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-blue-500',
      green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 border-green-500',
      purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 border-purple-500',
      orange: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 border-orange-500'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <ProfessorSidebar email={userEmail || 'Loading...'} isAdmin={isAdmin} />
      
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
                <BarChart3 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                <span>Reports & Analytics</span>
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Generate comprehensive reports with export options
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
            </button>
          </div>
        </div>

        {/* Report Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {reports.map((report) => {
            const Icon = report.icon;
            const isSelected = selectedReport === report.id;
            
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id as ReportType)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected 
                    ? `${getColorClasses(report.color)} border-current` 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-500'
                }`}
              >
                <Icon className={`h-6 w-6 mb-2 ${isSelected ? '' : 'text-gray-400'}`} />
                <h3 className={`font-semibold mb-1 ${isSelected ? '' : 'text-gray-900 dark:text-white'}`}>
                  {report.name}
                </h3>
                <p className={`text-xs ${isSelected ? 'opacity-80' : 'text-gray-500 dark:text-gray-400'}`}>
                  {report.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Academic Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Academic Year
                </label>
                <select
                  value={selectedYear || ''}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Years</option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.year_name} {year.is_active && '(Active)'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Building2 className="h-4 w-4 inline mr-1" />
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  dir="rtl"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Professor ID (for teaching load report) */}
              {selectedReport === 'teaching-load' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Users className="h-4 w-4 inline mr-1" />
                    Professor ID (Optional)
                  </label>
                  <input
                    type="number"
                    value={professorId}
                    onChange={(e) => setProfessorId(e.target.value)}
                    placeholder="Enter professor ID"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Export Options */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Export Options:</h3>
            <div className="flex space-x-3">
              <button
                onClick={exportToPDF}
                disabled={!reportData || loading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
              >
                <FileText className="h-4 w-4" />
                <span>PDF</span>
              </button>
              <button
                onClick={exportToExcel}
                disabled={!reportData || loading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
              >
                <Download className="h-4 w-4" />
                <span>Excel</span>
              </button>
              <button
                onClick={exportToPDF}
                disabled={!reportData || loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </button>
              <button
                onClick={sendByEmail}
                disabled={!reportData || loading}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
              >
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6" id="report-content">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : reportData ? (
            <div>
              {selectedReport === 'teaching-load' && <TeachingLoadReport data={reportData.data || []} />}
              {selectedReport === 'subject-coverage' && <SubjectCoverageReport data={reportData.data || []} summary={reportData.summary || {}} />}
              {selectedReport === 'department-statistics' && <DepartmentStatisticsReport data={reportData.data || []} />}
              {selectedReport === 'historical' && <HistoricalReport />}
            </div>
          ) : reportData === null ? (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <p className="text-red-600 dark:text-red-400 font-semibold mb-2">Error loading report</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Please check your filters and try again</p>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Select an academic year and click to generate report</p>
            </div>
          )}
        </div>
        </div>

        {/* Print Styles */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #report-content, #report-content * {
              visibility: visible;
            }
            #report-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}</style>
      </main>
    </div>
  );
}

// Report Components
function TeachingLoadReport({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400">No teaching load data available</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Teaching Load per Professor
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Professor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Rank
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Lectures
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Tutorials
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Both
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((prof) => (
              <tr key={prof.professor_id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {prof.full_name_latin}
                  </div>
                  {prof.full_name_arabic && (
                    <div className="text-xs text-gray-500 dark:text-gray-400" dir="rtl">
                      {prof.full_name_arabic}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400" dir="rtl">
                  {prof.department || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {prof.academic_rank || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                  {prof.lecture_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                  {prof.tutorial_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                  {prof.both_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {prof.total_preferences}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SubjectCoverageReport({ data, summary }: { data: any[]; summary: any }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400">No subject coverage data available</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Subject Coverage Status
      </h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Modules</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.totalModules}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Covered</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.coveredModules}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Uncovered</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.uncoveredModules}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Coverage</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{summary.coveragePercentage}%</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Module
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Semester
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Professors
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((module) => (
              <tr key={module.module_id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  {module.module_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400" dir="rtl">
                  {module.department_name || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {module.semester || '-'}
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-white">
                  {module.professor_count}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    parseInt(module.professor_count) > 0
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {parseInt(module.professor_count) > 0 ? 'Covered' : 'Uncovered'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DepartmentStatisticsReport({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400">No department statistics available</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Department Statistics
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Department
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Professors
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Modules
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Active Modules
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Preferences
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Active Profs
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((dept, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white" dir="rtl">
                  {dept.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                  {dept.professorCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                  {dept.moduleCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                  {dept.activeModuleCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                  {dept.preferenceCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  {dept.activeProfessors}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HistoricalReport() {
  return (
    <div className="text-center py-12">
      <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-400" />
      <p className="text-gray-500 dark:text-gray-400">
        Historical comparison feature coming soon...
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
        This will allow you to compare data across multiple academic years
      </p>
    </div>
  );
}
