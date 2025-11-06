import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  // Get locale from cookie or default to 'ar'
  const cookieStore = cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'ar';

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
