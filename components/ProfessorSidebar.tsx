'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  LayoutDashboard, 
  BookOpen, 
  BarChart3,
  User,
  LogOut,
  ArrowLeftRight
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

interface ProfessorSidebarProps {
  email: string;
  isAdmin: boolean;
}

export default function ProfessorSidebar({ email, isAdmin }: ProfessorSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('dashboard');
  const tAuth = useTranslations('auth');
  const tAdmin = useTranslations('adminNav');

  const navigation = [
    { name: t('title'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('cards.teachingPreferences.title'), href: '/dashboard/teaching-preferences', icon: BookOpen },
    ...(isAdmin ? [{ name: t('cards.reports.title'), href: '/dashboard/reports', icon: BarChart3 }] : []),
    { name: t('cards.profile.title'), href: '/dashboard/profile', icon: User },
  ];

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
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-gray-800 px-6">
        <h1 className="text-xl font-bold">{t('title')}</h1>
        <LanguageSwitcher />
      </div>

      {/* User Info */}
      <div className="border-b border-gray-800 p-4">
        <p className="text-sm text-gray-400 truncate">{email}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center space-x-3 gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer - Switch View & Sign Out */}
      <div className="border-t border-gray-800 p-4 space-y-2">
        {isAdmin && (
          <button
            onClick={switchToAdminView}
            className="flex w-full items-center space-x-3 gap-2 rounded-lg px-3 py-2 text-sm font-medium bg-indigo-700 hover:bg-indigo-600 text-white transition-colors"
          >
            <ArrowLeftRight className="h-5 w-5" />
            <span>{tAdmin('switchToAdmin')}</span>
          </button>
        )}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center space-x-3 gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          <span>{tAuth('signOut')}</span>
        </button>
      </div>
    </div>
  );
}
