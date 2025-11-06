# ✅ إصلاح جميع أخطاء 401 - Public API Endpoints

## 🐛 المشكلة

```
GET /api/admin/academic-years 401 (Unauthorized)
GET /api/admin/specialties 401 (Unauthorized)
GET /api/admin/modules 401 (Unauthorized)
```

**السبب:**
- صفحات الأساتذة تستدعي endpoints تتطلب صلاحيات admin
- الأساتذة لا يملكون صلاحيات admin
- النتيجة: 401 Unauthorized

---

## ✅ الحل الشامل

### إنشاء Public API Endpoints

أنشأت 3 endpoints عامة متاحة لجميع المستخدمين المسجلين (قراءة فقط):

---

### 1️⃣ Academic Years API

**الملف:** `app/api/academic-years/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
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

---

### 2️⃣ Specialties API

**الملف:** `app/api/specialties/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const specialties = await sql`
      SELECT s.*, d.name as department_name
      FROM specialties s
      LEFT JOIN departments d ON s.department_id = d.id
      ORDER BY d.name, s.name
    `;

    return NextResponse.json({ specialties }, { status: 200 });
  } catch (error: any) {
    console.error('Get specialties error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch specialties' },
      { status: 500 }
    );
  }
}
```

---

### 3️⃣ Modules API

**الملف:** `app/api/modules/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const specialtyId = searchParams.get('specialtyId');

    let modules;
    
    if (specialtyId) {
      modules = await sql`
        SELECT m.*, s.name as specialty_name, s.level as specialty_level
        FROM modules m
        LEFT JOIN specialties s ON m.specialty_id = s.id
        WHERE m.specialty_id = ${parseInt(specialtyId)}
        ORDER BY m.semester, m.module_name
      `;
    } else {
      modules = await sql`
        SELECT m.*, s.name as specialty_name, s.level as specialty_level
        FROM modules m
        LEFT JOIN specialties s ON m.specialty_id = s.id
        ORDER BY s.name, m.semester, m.module_name
      `;
    }

    return NextResponse.json({ modules }, { status: 200 });
  } catch (error: any) {
    console.error('Get modules error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    );
  }
}
```

---

## 📝 تحديث الملفات

### TeachingPreferences.tsx

```typescript
// ❌ قبل
const response = await fetch('/api/admin/academic-years');
const response = await fetch('/api/admin/specialties');
const response = await fetch(`/api/admin/modules?specialtyId=${specialtyId}`);

// ✅ بعد
const response = await fetch('/api/academic-years');
const response = await fetch('/api/specialties');
const response = await fetch(`/api/modules?specialtyId=${specialtyId}`);
```

### dashboard/reports/page.tsx

```typescript
// ❌ قبل
const response = await fetch('/api/admin/academic-years');

// ✅ بعد
const response = await fetch('/api/academic-years');
```

---

## 🏗️ البنية النهائية للـ API

```
/api/
├── academic-years/          ✅ عام (قراءة فقط)
│   └── route.ts
├── specialties/             ✅ عام (قراءة فقط)
│   └── route.ts
├── modules/                 ✅ عام (قراءة فقط)
│   └── route.ts
└── admin/
    ├── academic-years/      🔒 للإدارة (جميع العمليات)
    │   └── route.ts
    ├── specialties/         🔒 للإدارة (جميع العمليات)
    │   └── route.ts
    └── modules/             🔒 للإدارة (جميع العمليات)
        └── route.ts
```

---

## 📊 مقارنة الـ Endpoints

| المورد | Endpoint عام | Endpoint إداري |
|--------|-------------|----------------|
| **Academic Years** | `/api/academic-years` | `/api/admin/academic-years` |
| **Specialties** | `/api/specialties` | `/api/admin/specialties` |
| **Modules** | `/api/modules` | `/api/admin/modules` |

### الفرق:

| Endpoint | الوصول | العمليات المسموحة |
|----------|--------|-------------------|
| `/api/*` | ✅ جميع المستخدمين المسجلين | `GET` (قراءة فقط) |
| `/api/admin/*` | 🔒 Admins فقط | `GET`, `POST`, `PUT`, `DELETE` |

---

## ✅ النتيجة

الآن جميع الصفحات تعمل:

- ✅ **Teaching Preferences** - الأساتذة يمكنهم إدراج رغباتهم
- ✅ **Reports** - الجميع يمكنه مشاهدة التقارير
- ✅ **Admin Pages** - الإدارة تستطيع التعديل والإضافة
- 🔒 **الأمان** - فقط الإدارة تستطيع التعديل

---

## 🚀 للتجربة

1. أعد تحميل الصفحة (F5)
2. افتح Teaching Preferences
3. ✅ يجب أن تظهر جميع الخيارات بدون أخطاء 401!

---

## 📋 ملخص التعديلات

### ملفات جديدة:
1. ✅ `app/api/academic-years/route.ts`
2. ✅ `app/api/specialties/route.ts`
3. ✅ `app/api/modules/route.ts`

### ملفات محدثة:
1. ✅ `components/TeachingPreferences.tsx`
2. ✅ `app/dashboard/reports/page.tsx`

---

**جميع أخطاء 401 تم إصلاحها! 🎉✨**
