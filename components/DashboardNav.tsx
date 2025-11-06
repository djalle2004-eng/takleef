'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeftRight, LogOut } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

interface DashboardNavProps {
  email: string;
  isAdmin: boolean;
}

export default function DashboardNav({ email, isAdmin }: DashboardNavProps) {
  const router = useRouter();
  const t = useTranslations('dashboard');
  const tAuth = useTranslations('auth');
  const tAdmin = useTranslations('adminNav');

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      window.location.href = '/signin';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const switchToAdminView = () => {
    router.push('/admin');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('title')}
            </h1>
          </div>
          <div className="flex items-center space-x-4 gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {email}
            </span>
            <LanguageSwitcher />
            {isAdmin && (
              <button
                onClick={switchToAdminView}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span>{tAdmin('switchToAdmin')}</span>
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>{tAuth('signOut')}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
