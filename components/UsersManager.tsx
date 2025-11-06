'use client';

import { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, ToggleLeft, ToggleRight, X, Upload } from 'lucide-react';
import ImportProfessors from './ImportProfessors';

interface User {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  full_name_latin: string;
  full_name_arabic: string;
  academic_rank: string;
  professional_email: string;
  personal_email: string;
  primary_phone: string;
  secondary_phone: string;
  phd_specialization: string;
  field_of_research: string;
  department: string;
}

export default function UsersManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();
      setSelectedUser(data.user);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleEditUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();
      setSelectedUser(data.user);
      setEditFormData({
        email: data.user.email,
        fullNameLatin: data.user.full_name_latin || '',
        fullNameArabic: data.user.full_name_arabic || '',
        academicRank: data.user.academic_rank || '',
        department: data.user.department || '',
        primaryPhone: data.user.primary_phone || '',
        phdSpecialization: data.user.phd_specialization || '',
      });
      setShowEditModal(true);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editFormData.email,
          profile: {
            fullNameLatin: editFormData.fullNameLatin,
            fullNameArabic: editFormData.fullNameArabic,
            academicRank: editFormData.academicRank,
            department: editFormData.department,
            primaryPhone: editFormData.primaryPhone,
            phdSpecialization: editFormData.phdSpecialization,
          },
        }),
      });

      if (response.ok) {
        await fetchUsers();
        setShowEditModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage professors and their accounts
          </p>
        </div>
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Upload className="h-5 w-5" />
          <span>Import from Excel</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-lg bg-white shadow dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Academic Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Role
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {users.map((user) => (
                <tr key={user.id} className={!user.is_active ? 'opacity-60' : ''}>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {user.full_name_latin || 'No profile'}
                    </div>
                    {user.full_name_arabic && (
                      <div className="text-gray-500 dark:text-gray-400 text-xs" dir="rtl">
                        {user.full_name_arabic}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400" dir="rtl">
                    {user.department || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {user.academic_rank || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => toggleUserStatus(user.id, user.is_active)}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        user.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {user.is_active ? <ToggleRight className="h-3 w-3 mr-1" /> : <ToggleLeft className="h-3 w-3 mr-1" />}
                      {user.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleViewUser(user.id)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 inline-flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleEditUser(user.id)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    {user.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 inline-flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Profile Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowViewModal(false)}></div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Professor Profile
                </h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name (Latin)</label>
                    <p className="text-gray-900 dark:text-white">{selectedUser.full_name_latin || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">الاسم الكامل (عربي)</label>
                    <p className="text-gray-900 dark:text-white" dir="rtl">{selectedUser.full_name_arabic || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Academic Rank</label>
                    <p className="text-gray-900 dark:text-white">{selectedUser.academic_rank || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</label>
                    <p className="text-gray-900 dark:text-white" dir="rtl">{selectedUser.department || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Professional Email</label>
                    <p className="text-gray-900 dark:text-white">{selectedUser.professional_email || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Personal Email</label>
                    <p className="text-gray-900 dark:text-white">{selectedUser.personal_email || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Primary Phone</label>
                    <p className="text-gray-900 dark:text-white">{selectedUser.primary_phone || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Secondary Phone</label>
                    <p className="text-gray-900 dark:text-white">{selectedUser.secondary_phone || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">PhD Specialization</label>
                    <p className="text-gray-900 dark:text-white">{selectedUser.phd_specialization || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Field of Research</label>
                    <p className="text-gray-900 dark:text-white">{selectedUser.field_of_research || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowEditModal(false)}></div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edit Professor
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name (Latin)
                    </label>
                    <input
                      type="text"
                      value={editFormData.fullNameLatin}
                      onChange={(e) => setEditFormData({ ...editFormData, fullNameLatin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      الاسم الكامل (عربي)
                    </label>
                    <input
                      type="text"
                      value={editFormData.fullNameArabic}
                      onChange={(e) => setEditFormData({ ...editFormData, fullNameArabic: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Academic Rank
                    </label>
                    <input
                      type="text"
                      value={editFormData.academicRank}
                      onChange={(e) => setEditFormData({ ...editFormData, academicRank: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={editFormData.department}
                      onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Primary Phone
                    </label>
                    <input
                      type="text"
                      value={editFormData.primaryPhone}
                      onChange={(e) => setEditFormData({ ...editFormData, primaryPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      PhD Specialization
                    </label>
                    <input
                      type="text"
                      value={editFormData.phdSpecialization}
                      onChange={(e) => setEditFormData({ ...editFormData, phdSpecialization: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setShowEditModal(false)}
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

      {/* Import Modal */}
      {showImportModal && (
        <ImportProfessors
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            fetchUsers();
            setShowImportModal(false);
          }}
        />
      )}
    </div>
  );
}
