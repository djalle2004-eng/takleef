# Complete I18n Installation Guide

## ✅ What Has Been Done

1. **Created comprehensive Arabic translation file** (`messages/ar.json`)
   - Over 300+ translation keys
   - Organized by feature (auth, dashboard, admin, etc.)
   - Includes all UI text, errors, validation messages

2. **Created i18n configuration** (`i18n.ts`)
   - Set Arabic (`ar`) as default locale
   - Configured to load Arabic translations

3. **Created next.config.js**
   - Configured with next-intl plugin
   - Ready for i18n routing

4. **Updated root layout** (`app/layout.tsx`)
   - Added `dir="rtl"` for Right-to-Left text direction
   - Added `lang="ar"` attribute
   - Wrapped app with `NextIntlClientProvider`
   - Updated metadata to Arabic

## 📦 Installation Steps

### Step 1: Install next-intl

Run this command in your terminal:

```bash
npm install next-intl
```

### Step 2: Verify Installation

After installation, the TypeScript errors in the IDE should disappear. If they persist:

```bash
# Clear cache and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

### Step 3: Restart Dev Server

```bash
npm run dev
```

## 🎨 RTL CSS Considerations

The application now uses RTL (Right-to-Left) layout. Tailwind CSS automatically handles most RTL conversions, but here are some guidelines:

### Automatic RTL Support:
- `text-left` → `text-right` in RTL
- `ml-4` → `mr-4` in RTL
- `pl-6` → `pr-6` in RTL
- Flexbox order reverses
- Grid flow adapts

### Manual RTL Adjustments (if needed):
Use logical properties:
- `start` instead of `left`
- `end` instead of `right`

Example:
```html
<!-- Good for RTL -->
<div class="rtl:text-right ltr:text-left">

<!-- Or use start/end -->
<div class="text-start">  <!-- Always aligned to the start of text direction -->
```

## 🔧 Using Translations in Components

### In Server Components:

```typescript
import { useTranslations } from 'next-intl';

export default function MyPage() {
  const t = useTranslations('dashboard');
  
  return (
    <div>
      <h1>{t('title')}</h1>  {/* Output: لوحة التحكم */}
      <p>{t('welcome')}</p>  {/* Output: مرحباً */}
    </div>
  );
}
```

### In Client Components:

```typescript
'use client';

import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('common');
  
  return (
    <button>{t('save')}</button>  {/* Output: حفظ */}
  );
}
```

### Nested Translations:

```typescript
// Access nested keys
const t = useTranslations('auth.signIn');

<h1>{t('title')}</h1>           // تسجيل الدخول إلى منصة تكليف
<label>{t('emailLabel')}</label> // البريد الإلكتروني المهني
```

### Using in Multiple Sections:

```typescript
const tCommon = useTranslations('common');
const tAuth = useTranslations('auth.signIn');

<button>{tCommon('save')}</button>
<h1>{tAuth('title')}</h1>
```

## 📝 Translation Keys Structure

All translations are in `messages/ar.json`:

```
common/          # Shared UI elements (save, delete, cancel, etc.)
auth/            # Authentication (sign in, sign up, errors)
  signIn/
  signUp/
  errors/
profile/         # Professor profile form
dashboard/       # Professor dashboard
adminNav/        # Admin navigation
adminDashboard/  # Admin dashboard
modules/         # Module management
users/           # User management
preferences/     # Teaching preferences
viewPreferences/ # Admin view preferences
reports/         # Reports and analytics
academicYears/   # Academic year management
notifications/   # Toast messages
validation/      # Form validation
footer/          # Footer texts
```

## 🚀 Quick Start: Converting a Page

### Before (Hardcoded English):
```typescript
export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>
      <button>Save</button>
      <button>Cancel</button>
    </div>
  );
}
```

### After (i18n with Arabic):
```typescript
import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  
  return (
    <div>
      <h1>{t('title')}</h1>           {/* لوحة التحكم */}
      <button>{tCommon('save')}</button>    {/* حفظ */}
      <button>{tCommon('cancel')}</button>  {/* إلغاء */}
    </div>
  );
}
```

## 🔍 Finding Translation Keys

To find the correct translation key, open `messages/ar.json` and search for the Arabic text you need, or browse the structure:

Example: Need "Sign In" button text?
1. Look in `auth.signIn.signInButton` → "دخول"

Example: Need "Department" label?
1. Look in `profile.fields.department` → "القسم"

## ✨ Best Practices

1. **Always use translation keys**
   - ❌ Don't: `<button>Save</button>`
   - ✅ Do: `<button>{t('common.save')}</button>`

2. **Organize by feature**
   - Group related translations together
   - Use nested objects for better organization

3. **Use semantic key names**
   - ❌ Don't: `btn1`, `text2`
   - ✅ Do: `saveButton`, `welcomeMessage`

4. **Keep translations flat where possible**
   - Access: `t('signIn.title')` instead of `t('signIn').title`

5. **Don't concatenate translations**
   - ❌ Don't: `{t('hello')} {t('world')}`
   - ✅ Do: Create one key: `helloWorld: "مرحبا بالعالم"`

## 🐛 Troubleshooting

### Error: "Cannot find module 'next-intl'"
**Solution**: Run `npm install next-intl`

### Error: Missing translation key
**Solution**: Add the key to `messages/ar.json`

### Text not showing in Arabic
**Solution**: 
1. Check you're using `useTranslations` correctly
2. Verify the key exists in `ar.json`
3. Check browser console for errors

### RTL not working
**Solution**: 
1. Verify `dir="rtl"` is in `<html>` tag
2. Clear browser cache
3. Restart dev server

### Icons/Images flipped incorrectly
**Solution**: Add `transform: scale(-1, 1)` to flip them back if needed

## 📋 Next Steps

After installation, refactor these files in order:

1. ✅ Root layout (DONE)
2. ⏳ Sign in page (`app/signin/page.tsx`)
3. ⏳ Sign up page (`app/signup/page.tsx`)
4. ⏳ Profile form (`app/complete-profile/page.tsx`)
5. ⏳ Dashboard (`app/dashboard/page.tsx`)
6. ⏳ Admin Sidebar (`components/AdminSidebar.tsx`)
7. ⏳ Module management pages
8. ⏳ User management pages
9. ⏳ Preferences pages
10. ⏳ Reports pages

## 📚 Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [RTL Styling Guide](https://rtlstyling.com/)
- [Arabic Typography](https://www.w3.org/International/articles/typography/)

## 💡 Tips

- Use `console.log(t.raw('section'))` to debug all translations in a section
- Keep translations short and clear
- Test on mobile devices for RTL layout
- Use Arabic native speakers for translation review
- Consider pluralization rules for dynamic content

---

**Ready to start!** Run `npm install next-intl` and begin converting components to use translations! 🎉
