'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  Users,
  LogOut,
  UserCircle,
  ArrowLeftRight,
  BarChart3
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';


export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('adminNav');
  const tAuth = useTranslations('auth');

  const navigation = [
    { name: t('dashboard'), href: '/admin', icon: LayoutDashboard },
    { name: t('academicYears'), href: '/admin/academic-years', icon: Calendar },
    { name: t('modules'), href: '/admin/modules', icon: BookOpen },
    { name: t('users'), href: '/admin/users', icon: Users },
    { name: t('preferences'), href: '/admin/preferences', icon: BookOpen },
    { name: t('reports'), href: '/admin/reports', icon: BarChart3 },
  ];

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      window.location.href = '/signin';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const switchToProfessorView = () => {
    router.push('/dashboard');
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-gray-800 px-6">
        <h1 className="text-xl font-bold">{t('adminPanel')}</h1>
        <LanguageSwitcher />
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
                flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
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
        <button
          onClick={switchToProfessorView}
          className="flex w-full items-center space-x-3 gap-2 rounded-lg px-3 py-2 text-sm font-medium bg-indigo-700 hover:bg-indigo-600 text-white transition-colors"
        >
          <ArrowLeftRight className="h-5 w-5" />
          <span>{t('switchToProfessor')}</span>
        </button>
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
