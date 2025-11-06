# 🔧 التحليل التقني - مشروع Takleef

## 📦 Stack التقني الكامل

### Frontend
```yaml
Framework: Next.js 14.2.18
  - App Router: ✅
  - Server Components: ✅  
  - Client Components: ✅
  - API Routes: ✅
  - Middleware: ✅

UI Library: React 18.3.1
  - Hooks (useState, useEffect, etc.)
  - Context API
  - Event Handling

TypeScript: 5.x
  - Full Type Safety
  - Interface Definitions
  - Zod Integration

Styling: Tailwind CSS 3.4.1
  - Utility-First
  - Responsive Design
  - Dark Mode Support
  - Custom Config

Icons: Lucide React 0.263.1
  - 1000+ Icons
  - Tree-Shakeable
  - Consistent Design
```

### Backend & Database
```yaml
Database: Neon PostgreSQL
  - Serverless
  - Auto-scaling
  - Connection Pooling
  - Located in Cloud

ORM: Direct SQL Queries
  - @neondatabase/serverless ^0.9.0
  - Parameterized Queries
  - SQL Injection Protection
  
Query Pattern:
  import { sql } from '@neondatabase/serverless';
  const result = await sql`SELECT * FROM users WHERE id = ${userId}`;
```

### Authentication & Security
```yaml
JWT: jose ^5.2.0
  - Token Generation
  - Token Verification
  - Expiration Handling
  - Algorithm: HS256

Password Hashing: bcryptjs ^2.4.3
  - Salt Rounds: 10
  - One-way Hashing
  - Compare Function

Session Management:
  - HTTP-only Cookies
  - 7-day Expiration
  - Secure Flag (Production)
  - SameSite: Lax
```

### Validation
```yaml
Zod: ^3.23.8
  - Schema Definition
  - Runtime Validation
  - Type Inference
  - Custom Error Messages

Example:
  const professorSchema = z.object({
    fullNameArabic: z.string().min(1),
    academicRank: z.string(),
    department: z.string()
  });
```

### Internationalization
```yaml
next-intl: ^4.3.12
  - 2 Languages: Arabic (default), English
  - 300+ Translation Keys
  - RTL/LTR Support
  - Cookie Persistence

Structure:
  messages/
  ├── ar.json (472 lines)
  └── en.json (472 lines)
```

### Data Processing
```yaml
XLSX: ^0.18.5
  - Excel Import
  - Excel Export  
  - Sheet Manipulation
  - Format Conversion

Use Cases:
  - Import Professors
  - Import Modules
  - Export Reports
  - Download Templates
```

---

## 🏗️ هيكل المشروع

### الهيكل العام
```
takleef/
├── app/
│   ├── admin/              # لوحة الإدارة
│   ├── api/                # نقاط النهاية API
│   ├── dashboard/          # لوحة الأساتذة
│   ├── signin/             # صفحات المصادقة
│   ├── signup/
│   ├── forgot-password/
│   ├── reset-password/
│   ├── complete-profile/
│   ├── layout.tsx          # التخطيط الرئيسي
│   ├── page.tsx            # الصفحة الرئيسية
│   └── globals.css         # الأنماط العامة
│
├── components/             # مكونات React
│   ├── AdminSidebar.tsx
│   ├── DashboardNav.tsx
│   ├── TeachingPreferences.tsx
│   ├── AcademicYearsManager.tsx
│   ├── ModulesManager.tsx
│   ├── UsersManager.tsx
│   ├── ImportProfessors.tsx
│   ├── ImportModules.tsx
│   ├── LanguageSwitcher.tsx
│   └── SignOutButton.tsx
│
├── lib/                    # المكتبات والأدوات
│   ├── db.ts               # إعداد قاعدة البيانات
│   ├── auth.ts             # أدوات المصادقة
│   └── validations.ts      # schemas Zod
│
├── messages/               # ملفات الترجمة
│   ├── ar.json
│   └── en.json
│
├── middleware.ts           # حماية المسارات
├── i18n.ts                 # إعداد الترجمة
├── next.config.js          # إعداد Next.js
├── tailwind.config.ts      # إعداد Tailwind
├── tsconfig.json           # إعداد TypeScript
└── package.json            # التبعيات
```

---

## 🔐 نظام المصادقة

### آلية JWT

#### 1. إنشاء Token
```typescript
import { SignJWT } from 'jose';

const token = await new SignJWT({
  userId: user.id,
  email: user.email,
  role: user.role
})
  .setProtectedHeader({ alg: 'HS256' })
  .setExpirationTime('7d')
  .sign(new TextEncoder().encode(JWT_SECRET));
```

#### 2. تخزين Token
```typescript
// HTTP-only Cookie
cookies().set('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7 // 7 days
});
```

#### 3. التحقق من Token
```typescript
import { jwtVerify } from 'jose';

const { payload } = await jwtVerify(
  token,
  new TextEncoder().encode(JWT_SECRET)
);

return {
  userId: payload.userId,
  email: payload.email,
  role: payload.role
};
```

### تشفير كلمة المرور

```typescript
import bcrypt from 'bcryptjs';

// Hash
const hashedPassword = await bcrypt.hash(password, 10);

// Compare
const isValid = await bcrypt.compare(password, hashedPassword);
```

### Middleware للحماية

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  // Check authentication
  if (!token && isProtectedRoute(path)) {
    return NextResponse.redirect('/signin');
  }
  
  // Check admin role
  if (isAdminRoute(path)) {
    const user = await verifyToken(token);
    if (user.role !== 'ADMIN') {
      return NextResponse.redirect('/dashboard');
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/complete-profile']
};
```

---

## 📡 نظام API

### بنية API Routes

```
app/api/
├── auth/
│   ├── signin/route.ts          POST
│   ├── signup/route.ts          POST
│   ├── signout/route.ts         POST
│   ├── forgot-password/route.ts POST
│   ├── reset-password/route.ts  POST
│   └── me/route.ts              GET
│
├── profile/
│   ├── complete/route.ts        GET, POST
│   └── status/route.ts          GET
│
├── admin/
│   ├── academic-years/
│   │   ├── route.ts             GET, POST
│   │   └── [id]/route.ts        PUT, DELETE, PATCH
│   │
│   ├── semesters/route.ts       GET
│   │
│   ├── departments/route.ts     GET
│   │
│   ├── specialties/
│   │   ├── route.ts             GET, POST
│   │   └── [id]/route.ts        PUT, DELETE
│   │
│   ├── modules/
│   │   ├── route.ts             GET, POST
│   │   ├── [id]/route.ts        PUT, DELETE
│   │   └── bulk/route.ts        POST, PATCH, DELETE
│   │
│   ├── users/
│   │   ├── route.ts             GET
│   │   └── [id]/route.ts        GET, PUT, PATCH, DELETE
│   │
│   ├── professors/
│   │   └── import/route.ts      POST
│   │
│   ├── preferences/route.ts     GET
│   │
│   └── statistics/route.ts      GET
│
├── preferences/route.ts         GET, POST
│
├── reports/
│   ├── teaching-load/route.ts
│   ├── subject-coverage/route.ts
│   ├── department-statistics/route.ts
│   └── preferences-matrix/route.ts
│
├── academic-years/route.ts      GET (Public)
├── specialties/route.ts         GET (Public)
└── modules/route.ts             GET (Public)
```

### نمط استدعاء API

#### على Server Components
```typescript
// مباشر في Server Component
const { sql } = await import('@neondatabase/serverless');
const data = await sql`SELECT * FROM users`;
```

#### على Client Components
```typescript
// استخدام fetch API
const response = await fetch('/api/admin/users');
const data = await response.json();
```

### معالجة الأخطاء

```typescript
// في API Routes
try {
  const result = await sql`SELECT ...`;
  return NextResponse.json({ data: result.rows });
} catch (error) {
  console.error('Database error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

---

## 🎨 نظام التصميم

### Tailwind Configuration

```typescript
// tailwind.config.ts
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors if any
      }
    }
  },
  plugins: [],
  darkMode: 'class'
}
```

### نظام الألوان

```css
/* Primary: Indigo/Blue */
bg-indigo-600, text-indigo-600
hover:bg-indigo-700

/* Success: Green */
bg-green-600, text-green-600

/* Warning: Yellow/Orange */
bg-yellow-500, bg-orange-500

/* Danger: Red */
bg-red-600, text-red-600

/* Neutral: Gray */
bg-gray-100, bg-gray-800 (dark mode)
```

### Responsive Breakpoints

```yaml
sm: 640px   # Mobile landscape
md: 768px   # Tablet
lg: 1024px  # Desktop
xl: 1280px  # Large desktop
2xl: 1536px # Extra large
```

### RTL Support

```typescript
// في layout.tsx
<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
```

```css
/* Tailwind RTL utilities تلقائي */
ms-4  /* margin-start */
me-4  /* margin-end */
ps-4  /* padding-start */
pe-4  /* padding-end */
```

---

## 🌍 نظام الترجمة (i18n)

### الإعداد

```typescript
// i18n.ts
import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'ar';
  
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
```

### الاستخدام في المكونات

```typescript
// Client Component
'use client';
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('dashboard');
  
  return <h1>{t('title')}</h1>;
}
```

```typescript
// Server Component
import { useTranslations } from 'next-intl';

export default function MyPage() {
  const t = useTranslations('dashboard');
  
  return <h1>{t('title')}</h1>;
}
```

### هيكل ملفات الترجمة

```json
{
  "common": {
    "welcome": "مرحباً",
    "save": "حفظ",
    "cancel": "إلغاء"
  },
  "dashboard": {
    "title": "لوحة التحكم",
    "greeting": "مرحباً بك، {name}"
  },
  "auth": {
    "signIn": {
      "title": "تسجيل الدخول",
      "emailLabel": "البريد الإلكتروني"
    }
  }
}
```

---

## 📊 معالجة البيانات

### استيراد Excel

```typescript
import * as XLSX from 'xlsx';

// قراءة الملف
const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

// معالجة كل صف
for (const row of data) {
  await sql`
    INSERT INTO professors (...)
    VALUES (...)
  `;
}
```

### تصدير Excel

```typescript
import * as XLSX from 'xlsx';

// إنشاء Worksheet
const ws = XLSX.utils.json_to_sheet(data);

// إنشاء Workbook
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

// كتابة الملف
const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

// إرجاع Response
return new Response(buffer, {
  headers: {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': 'attachment; filename=report.xlsx'
  }
});
```

---

## ⚡ الأداء والتحسينات

### Server Components
```typescript
// استخدام Server Components للبيانات الثابتة
export default async function Page() {
  const data = await fetchData(); // Server-side
  return <div>{data}</div>;
}
```

### Client Components فقط عند الحاجة
```typescript
'use client'; // فقط للمكونات التفاعلية
import { useState } from 'react';

export default function InteractiveForm() {
  const [value, setValue] = useState('');
  // ...
}
```

### تحميل الصور المحسنة
```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  width={200}
  height={200}
  alt="Logo"
  priority
/>
```

### Lazy Loading للمكونات الكبيرة
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>
});
```

---

## 🔧 أدوات التطوير

### Scripts المتاحة

```json
{
  "dev": "next dev",           // Development server
  "build": "next build",       // Production build
  "start": "next start",       // Production server
  "lint": "next lint"          // ESLint
}
```

### متغيرات البيئة

```env
# Required
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development|production
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## 🚀 النشر (Deployment)

### Vercel (الموصى به)
```bash
# تثبيت Vercel CLI
npm i -g vercel

# النشر
vercel

# الإنتاج
vercel --prod
```

### متطلبات الإنتاج
```yaml
Environment Variables:
  - DATABASE_URL (Production DB)
  - JWT_SECRET (Secure Random String)
  - NEXT_PUBLIC_APP_URL (Your Domain)
  - NODE_ENV=production

Database:
  - Neon Production Database
  - Connection Pooling Enabled
  - SSL Enabled

Security:
  - HTTPS Only
  - Secure Cookies
  - CORS Configuration
  - Rate Limiting (Recommended)
```

---

## 📈 المراقبة والتسجيل

### Console Logs
```typescript
console.log('[API] Request:', request);
console.error('[DB] Error:', error);
```

### Error Boundaries
```typescript
// app/error.tsx
'use client';

export default function Error({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>حدث خطأ!</h2>
      <button onClick={() => reset()}>حاول مرة أخرى</button>
    </div>
  );
}
```

---

## 🔍 الاختبار والتطوير

### التطوير المحلي
```bash
# تشغيل السيرفر
npm run dev

# الوصول
http://localhost:3000
```

### اختبار API
```bash
# باستخدام curl
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@univ-eloued.dz","password":"password"}'
```

### أدوات مفيدة
- **React DevTools** - فحص المكونات
- **Network Tab** - مراقبة Requests
- **Console** - عرض Errors
- **Postman/Insomnia** - اختبار API

---

**التحليل التقني الكامل جاهز!** 🔧
