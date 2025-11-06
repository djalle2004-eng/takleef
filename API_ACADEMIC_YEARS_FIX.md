# ✅ إصلاح خطأ 401 - Academic Years API

## 🐛 المشكلة

```
GET http://localhost:3000/api/admin/academic-years 401 (Unauthorized)
```

**السبب:**
- صفحات الأساتذة (غير Admins) تستدعي `/api/admin/academic-years`
- هذا الـ endpoint يتطلب صلاحيات admin فقط
- الأساتذة لا يملكون صلاحيات admin → 401 Unauthorized

## ✅ الحل

### 1. إنشاء API Endpoint عام

أنشأت `/api/academic-years` - متاح لجميع المستخدمين المسجلين:

**الملف:** `app/api/academic-years/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    // ✅ يتطلب فقط تسجيل الدخول (أي مستخدم)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const academicYears = await sql`
      SELECT * FROM academic_years 
      ORDER BY start_date DESC
    `;

    return NextResponse.json({ academicYears }, { status: 200 });
  } catch (error: any) {
    console.error('Get academic years error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch academic years' },
      { status: 500 }
    );
  }
}
```

### 2. تحديث صفحات الأساتذة

#### **TeachingPreferences.tsx**

```typescript
// ❌ قبل
const response = await fetch('/api/admin/academic-years');

// ✅ بعد
const response = await fetch('/api/academic-years');
```

#### **dashboard/reports/page.tsx**

```typescript
// ❌ قبل
const response = await fetch('/api/admin/academic-years');

// ✅ بعد
const response = await fetch('/api/academic-years');
```

## 📝 البنية الجديدة

```
/api/
  ├── academic-years/          ✅ للجميع (قراءة فقط)
  │   └── route.ts
  └── admin/
      └── academic-years/      🔒 للإدارة فقط (كتابة + تعديل + حذف)
          └── route.ts
```

### الفرق بين الاثنين:

| Endpoint | الوصول | العمليات المسموحة |
|----------|--------|-------------------|
| `/api/academic-years` | ✅ جميع المستخدمين | GET (قراءة فقط) |
| `/api/admin/academic-years` | 🔒 Admins فقط | GET, POST, PUT, DELETE |

## ✅ النتيجة

الآن:
- ✅ الأساتذة يمكنهم قراءة السنوات الجامعية
- ✅ TeachingPreferences تعمل بدون أخطاء 401
- ✅ صفحة التقارير تعمل بدون أخطاء
- 🔒 فقط الإدارة يمكنها إضافة/تعديل/حذف السنوات

## 🚀 للتجربة

1. أعد تشغيل الـ server إذا لزم الأمر
2. افتح صفحة Teaching Preferences
3. ✅ يجب أن تظهر السنوات الجامعية بدون خطأ 401!

**المشكلة محلولة! 🎉**
