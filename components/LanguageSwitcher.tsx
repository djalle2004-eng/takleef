'use client';

import { useState } from 'react';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.lang || 'ar';
    }
    return 'ar';
  });

  const switchLanguage = async (locale: string) => {
    try {
      // Set cookie
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
      
      // Update HTML attributes
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
      
      setCurrentLocale(locale);
      
      // Reload page to apply changes
      window.location.reload();
    } catch (error) {
      console.error('Error switching language:', error);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => switchLanguage(currentLocale === 'ar' ? 'en' : 'ar')}
        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title={currentLocale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      >
        <Languages className="h-4 w-4" />
        <span className="font-semibold">
          {currentLocale === 'ar' ? 'EN' : 'عربي'}
        </span>
      </button>
    </div>
  );
}
