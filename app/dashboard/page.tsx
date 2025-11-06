import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';
import { getTranslations } from 'next-intl/server';
import DashboardNav from '@/components/DashboardNav';
import Link from 'next/link';
import { BookOpen, User, BarChart3 } from 'lucide-react';

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');
  const tProfile = await getTranslations('dashboard.profileInfo');
  const tCards = await getTranslations('dashboard.cards');
  
  const user = await getCurrentUser();

  if (!user) {
    redirect('/signin');
  }

  // Check if user has completed their profile
  const profileResult = await sql`
    SELECT * FROM professors WHERE user_id = ${user.userId}
  `;

  const hasProfile = profileResult.length > 0;

  // If no profile exists, redirect to complete profile page
  if (!hasProfile) {
    redirect('/complete-profile');
  }

  const profile = profileResult[0];

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <DashboardNav email={user.email} isAdmin={isAdmin} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('welcome')} {profile.full_name_arabic || profile.full_name_latin}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t('welcomeMessage')}
            </p>
          </div>

          {/* Quick Actions */}
          <div className={`grid grid-cols-1 md:grid-cols-${isAdmin ? '3' : '2'} gap-6 mb-6`}>
            <Link href="/dashboard/teaching-preferences">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-indigo-500">
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-100 dark:bg-indigo-900 p-4 rounded-lg">
                    <BookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {tCards('teachingPreferences.title')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {tCards('teachingPreferences.description')}
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {isAdmin && (
              <Link href="/dashboard/reports">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-green-500">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
                      <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {tCards('reports.title')}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {tCards('reports.description')}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-2 border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <User className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {tCards('profile.title')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {tCards('profile.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {tProfile('title')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {tProfile('academicRank')}
                </label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {profile.academic_rank}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {tProfile('department')}
                </label>
                <p className="text-gray-900 dark:text-white font-medium" dir="rtl">
                  {profile.department}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {tProfile('professionalEmail')}
                </label>
                <p className="text-gray-900 dark:text-white">
                  {profile.professional_email}
                </p>
              </div>

              {profile.personal_email && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {tProfile('personalEmail')}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {profile.personal_email}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {tProfile('primaryPhone')}
                </label>
                <p className="text-gray-900 dark:text-white">
                  {profile.primary_phone}
                </p>
              </div>

              {profile.secondary_phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {tProfile('secondaryPhone') || 'Secondary Phone'}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {profile.secondary_phone}
                  </p>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {tProfile('phdSpecialization')}
                </label>
                <p className="text-gray-900 dark:text-white">
                  {profile.phd_specialization}
                </p>
              </div>

              {profile.field_of_research && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {tProfile('researchField')}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {profile.field_of_research}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
