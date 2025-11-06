# I18n Setup Instructions

## Step 1: Install next-intl

Run the following command to install next-intl:

```bash
npm install next-intl
```

## Step 2: File Structure Created

The following files have been created:

```
takleef/
├── messages/
│   └── ar.json          # Arabic translations (default)
├── i18n.ts              # i18n configuration
└── I18N_SETUP_INSTRUCTIONS.md  # This file
```

## Step 3: Update next.config.js

Create or update `next.config.js` with the following:

```javascript
const withNextIntl = require('next-intl/plugin')('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = withNextIntl(nextConfig);
```

## Step 4: What's Already Done

✅ Created comprehensive Arabic translation file (`messages/ar.json`)
✅ Created i18n configuration (`i18n.ts`)
✅ Arabic set as default locale
✅ Translations organized by feature/module

## Step 5: Translation File Structure

The `ar.json` file contains translations for:

- **common**: Shared UI elements (save, delete, cancel, etc.)
- **auth**: Authentication (sign in, sign up, errors)
- **profile**: Professor profile form
- **dashboard**: Professor dashboard
- **adminNav**: Admin navigation
- **adminDashboard**: Admin dashboard stats
- **modules**: Module management
- **users**: User management
- **preferences**: Teaching preferences
- **viewPreferences**: Admin view preferences
- **reports**: Reports and analytics
- **academicYears**: Academic year management
- **notifications**: Toast messages
- **validation**: Form validation messages
- **footer**: Footer texts

## Step 6: Usage in Components

### Using translations in Server Components:

```typescript
import {useTranslations} from 'next-intl';

export default function MyPage() {
  const t = useTranslations('dashboard');
  
  return <h1>{t('title')}</h1>; // Will output: لوحة التحكم
}
```

### Using translations in Client Components:

```typescript
'use client';

import {useTranslations} from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('common');
  
  return <button>{t('save')}</button>; // Will output: حفظ
}
```

### Accessing nested translations:

```typescript
const t = useTranslations('auth.signIn');

<h1>{t('title')}</h1>              // تسجيل الدخول إلى منصة تكليف
<label>{t('emailLabel')}</label>   // البريد الإلكتروني المهني
```

## Step 7: RTL Support

The layout will automatically set `dir="rtl"` for Arabic. CSS has been structured to support RTL with:

- Logical properties (margin-inline-start instead of margin-left)
- Flexbox and Grid (which naturally support RTL)
- Tailwind's RTL support

## Step 8: Adding New Translations

To add new translations, simply add them to `messages/ar.json`:

```json
{
  "myNewFeature": {
    "title": "عنوان الميزة",
    "description": "وصف الميزة"
  }
}
```

Then use in components:

```typescript
const t = useTranslations('myNewFeature');
<h2>{t('title')}</h2>
```

## Step 9: Next Steps

After installing next-intl, the following components need to be refactored:

1. ✅ Layout (add dir="rtl")
2. ⏳ Authentication pages (signin, signup)
3. ⏳ Profile completion form
4. ⏳ Dashboard pages
5. ⏳ Admin sidebar and navigation
6. ⏳ Module management
7. ⏳ User management
8. ⏳ Preferences pages
9. ⏳ Reports pages
10. ⏳ Shared components (buttons, modals, etc.)

## Important Notes

- The default locale is 'ar' (Arabic)
- URLs will NOT show `/ar/` prefix (e.g., `/dashboard` not `/ar/dashboard`)
- All text should come from translation files
- No hardcoded strings in components
- Use semantic keys (e.g., 'auth.signIn.title' not 'signInTitle')
- Keep translations organized by feature

## Testing

After setup, test by:

1. Starting the dev server: `npm run dev`
2. Navigating to any page
3. All text should appear in Arabic
4. Text direction should be RTL
5. No English hardcoded text should appear

## Troubleshooting

**Issue**: Translations not showing
**Solution**: Ensure next-intl is installed and next.config.js is properly configured

**Issue**: Text not RTL
**Solution**: Check that `dir="rtl"` is set in the layout

**Issue**: Missing translation key
**Solution**: Add the key to `messages/ar.json`

## Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [RTL CSS Guide](https://rtlcss.com/)
- [Arabic Typography Best Practices](https://www.w3.org/International/articles/typography/)
