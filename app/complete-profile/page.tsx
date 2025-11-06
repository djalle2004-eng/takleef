'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const academicRanks = [
  'Professor',
  'Associate Professor A',
  'Associate Professor B',
  'Assistant Professor A',
  'Assistant Professor B',
];

const departments = [
  'قسم العلوم الاقتصادية',
  'قسم العلوم المالية والمحاسبة',
  'قسم علوم التسيير',
  'قسم العلوم التجارية',
  'قسم الجذع المشترك',
];

export default function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const [formData, setFormData] = useState({
    fullNameArabic: '',
    fullNameLatin: '',
    academicRank: '',
    professionalEmail: '',
    personalEmail: '',
    primaryPhone: '',
    secondaryPhone: '',
    phdSpecialization: '',
    fieldOfResearch: '',
    department: '',
  });

  useEffect(() => {
    // Fetch user email
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUserEmail(data.user.email);
          setFormData(prev => ({
            ...prev,
            professionalEmail: data.user.email,
          }));
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'An error occurred while saving your profile');
        setLoading(false);
        return;
      }

      // Redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('An error occurred while saving your profile');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Complete Your Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Please fill in all required information to complete your registration
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Arabic */}
            <div>
              <label
                htmlFor="fullNameArabic"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Full Name (Arabic) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullNameArabic"
                name="fullNameArabic"
                required
                value={formData.fullNameArabic}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="الاسم الكامل بالعربية"
                dir="rtl"
              />
            </div>

            {/* Full Name Latin */}
            <div>
              <label
                htmlFor="fullNameLatin"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Full Name (Latin) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullNameLatin"
                name="fullNameLatin"
                required
                value={formData.fullNameLatin}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Full Name in Latin"
              />
            </div>

            {/* Academic Rank */}
            <div>
              <label
                htmlFor="academicRank"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Academic Rank <span className="text-red-500">*</span>
              </label>
              <select
                id="academicRank"
                name="academicRank"
                required
                value={formData.academicRank}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Academic Rank</option>
                {academicRanks.map(rank => (
                  <option key={rank} value={rank}>
                    {rank}
                  </option>
                ))}
              </select>
            </div>

            {/* Professional Email (Read-only) */}
            <div>
              <label
                htmlFor="professionalEmail"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Professional Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="professionalEmail"
                name="professionalEmail"
                required
                value={formData.professionalEmail}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed"
              />
            </div>

            {/* Personal Email */}
            <div>
              <label
                htmlFor="personalEmail"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Personal Email
              </label>
              <input
                type="email"
                id="personalEmail"
                name="personalEmail"
                value={formData.personalEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="personal@example.com"
              />
            </div>

            {/* Primary Phone */}
            <div>
              <label
                htmlFor="primaryPhone"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Primary Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="primaryPhone"
                name="primaryPhone"
                required
                value={formData.primaryPhone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="+213 XXX XXX XXX"
              />
            </div>

            {/* Secondary Phone */}
            <div>
              <label
                htmlFor="secondaryPhone"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Secondary Phone Number
              </label>
              <input
                type="tel"
                id="secondaryPhone"
                name="secondaryPhone"
                value={formData.secondaryPhone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="+213 XXX XXX XXX"
              />
            </div>

            {/* PhD Specialization */}
            <div>
              <label
                htmlFor="phdSpecialization"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                PhD Specialization <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="phdSpecialization"
                name="phdSpecialization"
                required
                value={formData.phdSpecialization}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Economics, Finance, Management"
              />
            </div>

            {/* Field of Research */}
            <div>
              <label
                htmlFor="fieldOfResearch"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Field of Research
              </label>
              <textarea
                id="fieldOfResearch"
                name="fieldOfResearch"
                value={formData.fieldOfResearch}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                placeholder="Describe your research interests and areas of expertise..."
              />
            </div>

            {/* Department */}
            <div>
              <label
                htmlFor="department"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Department <span className="text-red-500">*</span>
              </label>
              <select
                id="department"
                name="department"
                required
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                dir="rtl"
              >
                <option value="">اختر القسم</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? 'Saving Profile...' : 'Complete Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
