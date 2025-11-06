# ⚙️ تحليل الميزات والوحدات - مشروع Takleef

## جدول المحتويات
1. [نظام المصادقة](#auth-system)
2. [إدارة الملف الشخصي](#profile-management)
3. [السنوات الأكاديمية](#academic-years)
4. [الإدارة الهرمية للمقاييس](#hierarchical-modules)
5. [نظام التفضيلات](#preferences-system)
6. [إدارة المستخدمين](#user-management)
7. [الاستيراد والتصدير](#import-export)
8. [نظام التقارير](#reports-system)
9. [نظام الترجمة](#i18n-system)

---

## 🔐 1. نظام المصادقة {#auth-system}

### الصفحات
```
/signin            → تسجيل الدخول
/signup            → التسجيل
/forgot-password   → نسيت كلمة المرور
/reset-password    → إعادة تعيين كلمة المرور
```

### ميزات التسجيل

#### قيود البريد الإلكتروني
```typescript
// فقط @univ-eloued.dz
const emailSchema = z.string()
  .email()
  .regex(/@univ-eloued\.dz$/, "يجب استخدام البريد الجامعي");
```

#### تشفير كلمة المرور
```typescript
import bcrypt from 'bcryptjs';

// Hash with salt rounds = 10
const hashedPassword = await bcrypt.hash(password, 10);

// Store in database
await sql`INSERT INTO users (email, password_hash) VALUES (${email}, ${hashedPassword})`;
```

#### إنشاء JWT Token
```typescript
import { SignJWT } from 'jose';

const token = await new SignJWT({
  userId: user.id,
  email: user.email,
  role: user.role
})
  .setProtectedHeader({ alg: 'HS256' })
  .setExpirationTime('7d')
  .sign(secret);

// Set HTTP-only cookie
cookies().set('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 // 7 days
});
```

### ميزات تسجيل الدخول

#### التحقق من البريد وكلمة المرور
```typescript
// 1. جلب المستخدم
const user = await sql`SELECT * FROM users WHERE email = ${email}`;

// 2. التحقق من كلمة المرور
const isValid = await bcrypt.compare(password, user.password_hash);

// 3. إنشاء token
if (isValid) {
  const token = await createToken(user);
  // Set cookie
}
```

#### إعادة التوجيه التلقائي
```typescript
// بعد تسجيل دخول ناجح
if (user.role === 'ADMIN') {
  redirect('/admin');
} else {
  // التحقق من اكتمال الملف الشخصي
  const profile = await checkProfile(user.id);
  if (!profile) {
    redirect('/complete-profile');
  } else {
    redirect('/dashboard');
  }
}
```

### استعادة كلمة المرور

#### توليد رمز الاستعادة
```typescript
import { randomUUID } from 'crypto';

const token = randomUUID();
const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

await sql`
  INSERT INTO password_reset_tokens (user_id, token, expires_at)
  VALUES (${userId}, ${token}, ${expiresAt})
`;

// إنشاء رابط
const resetUrl = `${APP_URL}/reset-password?token=${token}`;
```

#### إعادة تعيين كلمة المرور
```typescript
// 1. التحقق من الرمز
const tokenData = await sql`
  SELECT * FROM password_reset_tokens 
  WHERE token = ${token} AND expires_at > NOW()
`;

// 2. تحديث كلمة المرور
const hashedPassword = await bcrypt.hash(newPassword, 10);
await sql`UPDATE users SET password_hash = ${hashedPassword} WHERE id = ${userId}`;

// 3. حذف الرمز
await sql`DELETE FROM password_reset_tokens WHERE token = ${token}`;
```

### حماية المسارات (Middleware)

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;

  // مسارات محمية
  const protectedRoutes = ['/dashboard', '/complete-profile'];
  const adminRoutes = ['/admin'];
  const authRoutes = ['/signin', '/signup'];

  // 1. التحقق من المصادقة
  if (!token && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // 2. التحقق من صلاحيات الإدارة
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    const user = verifyToken(token);
    if (user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 3. إعادة توجيه المستخدمين المصادق عليهم
  if (token && authRoutes.includes(pathname)) {
    const user = verifyToken(token);
    if (user.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}
```

---

## 👤 2. إدارة الملف الشخصي {#profile-management}

### الإكمال الإجباري

#### فحص حالة الملف الشخصي
```typescript
// في /dashboard/page.tsx
async function checkProfileStatus(userId: number) {
  const profile = await sql`
    SELECT profile_completed FROM professors WHERE user_id = ${userId}
  `;
  
  if (!profile || !profile.profile_completed) {
    redirect('/complete-profile');
  }
}
```

### صفحة إكمال الملف الشخصي

#### الحقول الإجبارية
```yaml
Required Fields:
  - full_name_arabic: "الاسم الكامل بالعربية"
  - full_name_latin: "Full Name in Latin"
  - academic_rank: [Dropdown]
      * Professor
      * Associate Professor A
      * Associate Professor B
      * Assistant Professor A
      * Assistant Professor B
  - professional_email: [Pre-filled, Read-only]
  - primary_phone: "+213 XXX XXX XXX"
  - phd_specialization: "PhD Specialization"
  - department: [Dropdown]
      * قسم العلوم الاقتصادية
      * قسم العلوم المالية والمحاسبة
      * قسم علوم التسيير
      * قسم العلوم التجارية
      * قسم الجذع المشترك
```

#### الحقول الاختيارية
```yaml
Optional Fields:
  - personal_email: "personal@example.com"
  - secondary_phone: "+213 XXX XXX XXX"
  - field_of_research: [Textarea]
```

#### حفظ الملف الشخصي
```typescript
// POST /api/profile/complete
const data = await request.json();

await sql`
  INSERT INTO professors (
    user_id, full_name_arabic, full_name_latin,
    academic_rank, professional_email, personal_email,
    primary_phone, secondary_phone, phd_specialization,
    field_of_research, department, profile_completed
  ) VALUES (
    ${userId}, ${data.fullNameArabic}, ${data.fullNameLatin},
    ${data.academicRank}, ${data.professionalEmail}, ${data.personalEmail},
    ${data.primaryPhone}, ${data.secondaryPhone}, ${data.phdSpecialization},
    ${data.fieldOfResearch}, ${data.department}, true
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name_arabic = ${data.fullNameArabic},
    full_name_latin = ${data.fullNameLatin},
    -- ... other fields
    updated_at = CURRENT_TIMESTAMP
`;
```

### عرض الملف الشخصي في Dashboard

```typescript
// في /dashboard/page.tsx
const profile = await sql`
  SELECT p.*, u.email 
  FROM professors p
  JOIN users u ON p.user_id = u.id
  WHERE p.user_id = ${userId}
`;

return (
  <div>
    <h1>{profile.full_name_arabic} | {profile.full_name_latin}</h1>
    <p>{profile.academic_rank} - {profile.department}</p>
    {/* عرض بقية المعلومات */}
  </div>
);
```

---

## 📅 3. السنوات الأكاديمية {#academic-years}

### الميزات الأساسية

#### إنشاء سنة أكاديمية
```typescript
// POST /api/admin/academic-years
const { yearName, startDate, endDate, isActive } = await request.json();

// 1. إنشاء السنة
const year = await sql`
  INSERT INTO academic_years (year_name, start_date, end_date, is_active)
  VALUES (${yearName}, ${startDate}, ${endDate}, ${isActive})
  RETURNING *
`;

// 2. إنشاء فصلين تلقائياً
const midpoint = calculateMidpoint(startDate, endDate);

await sql`
  INSERT INTO semesters (semester_name, semester_number, academic_year_id, start_date, end_date)
  VALUES 
    ('Semester 1', 1, ${year.id}, ${startDate}, ${midpoint}),
    ('Semester 2', 2, ${year.id}, ${midpoint}, ${endDate})
`;
```

#### حساب نقطة المنتصف
```typescript
function calculateMidpoint(start: Date, end: Date): Date {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  const midTime = (startTime + endTime) / 2;
  return new Date(midTime);
}
```

#### تفعيل سنة واحدة فقط
```typescript
// عند تفعيل سنة جديدة
await sql`UPDATE academic_years SET is_active = false`; // تعطيل الكل
await sql`UPDATE academic_years SET is_active = true WHERE id = ${yearId}`; // تفعيل المحددة
```

#### الأرشفة
```typescript
// PATCH /api/admin/academic-years/:id
const { isArchived } = await request.json();

await sql`
  UPDATE academic_years 
  SET is_archived = ${isArchived}, 
      is_active = ${isArchived ? false : 'is_active'} -- إلغاء التفعيل عند الأرشفة
  WHERE id = ${yearId}
`;
```

### واجهة المستخدم

#### العرض الهرمي القابل للتوسيع
```typescript
// في AcademicYearsManager.tsx
const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

const toggleYear = (yearId: number) => {
  const newExpanded = new Set(expandedYears);
  if (newExpanded.has(yearId)) {
    newExpanded.delete(yearId);
  } else {
    newExpanded.add(yearId);
  }
  setExpandedYears(newExpanded);
};

// في JSX
{expandedYears.has(year.id) && (
  <div className="semesters">
    {semesters.map(semester => (
      <SemesterCard key={semester.id} semester={semester} />
    ))}
  </div>
)}
```

---

## 📚 4. الإدارة الهرمية للمقاييس {#hierarchical-modules}

### البنية الهرمية

```
Department (5 أقسام ثابتة)
    ↓
Specialty (مستويات: جذع مشترك، ليسانس، ماستر)
    ↓
Module (S1-S6)
```

### سير العمل الإداري

#### 1. اختيار القسم
```typescript
// في /admin/modules
const departments = await sql`SELECT * FROM departments ORDER BY id`;

return (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {departments.map(dept => (
      <Link href={`/admin/modules/department/${dept.id}`}>
        <DepartmentCard department={dept} />
      </Link>
    ))}
  </div>
);
```

#### 2. إدارة التخصصات
```typescript
// في /admin/modules/department/[id]
const specialties = await sql`
  SELECT s.*, 
    (SELECT COUNT(*) FROM modules WHERE specialty_id = s.id) as module_count
  FROM specialties s
  WHERE s.department_id = ${departmentId}
`;

// CRUD للتخصصات
// POST /api/admin/specialties
await sql`
  INSERT INTO specialties (name, level, department_id)
  VALUES (${name}, ${level}, ${departmentId})
`;
```

#### 3. إدارة المقاييس
```typescript
// في /admin/modules/specialty/[id]
const modules = await sql`
  SELECT * FROM modules 
  WHERE specialty_id = ${specialtyId}
  ORDER BY semester, module_name
`;

// تجميع حسب الفصل
const groupedBySemester = modules.reduce((acc, module) => {
  if (!acc[module.semester]) acc[module.semester] = [];
  acc[module.semester].push(module);
  return acc;
}, {});

// عرض
{Object.entries(groupedBySemester).map(([semester, mods]) => (
  <div key={semester}>
    <h3>{semester}</h3>
    {mods.map(module => <ModuleCard key={module.id} module={module} />)}
  </div>
))}
```

### تفعيل/تعطيل المقاييس

```typescript
// Toggle Active Status
// PUT /api/admin/modules/:id
await sql`
  UPDATE modules 
  SET is_active_for_current_year = NOT is_active_for_current_year
  WHERE id = ${moduleId}
`;
```

### سير عمل الأساتذة

#### اختيار الرغبات
```typescript
// في /dashboard/teaching-preferences

// 1. اختيار المستوى
const [studyLevel, setStudyLevel] = useState<string>('');

// 2. جلب التخصصات للمستوى المحدد
const specialties = await fetch(`/api/specialties?level=${studyLevel}`);

// 3. جلب المقاييس للتخصص المحدد
const modules = await fetch(`/api/modules?specialtyId=${specialtyId}`);

// 4. عرض مجمعة حسب الفصل
const groupedModules = groupBySemester(modules);

// 5. حفظ الاختيارات
const savePreferences = async () => {
  await fetch('/api/preferences', {
    method: 'POST',
    body: JSON.stringify({
      preferences: selectedModules.map(m => ({
        moduleId: m.id,
        teachingType: m.teachingType,
        priorityLevel: m.priority
      }))
    })
  });
};
```

---

## 🎯 5. نظام التفضيلات {#preferences-system}

### حفظ التفضيلات

```typescript
// POST /api/preferences
const { preferences, academicYearId } = await request.json();
const professorId = user.id;

// حذف التفضيلات القديمة (إن وجدت)
await sql`
  DELETE FROM preferences 
  WHERE professor_id = ${professorId} 
    AND academic_year_id = ${academicYearId}
`;

// إدراج التفضيلات الجديدة
for (const pref of preferences) {
  await sql`
    INSERT INTO preferences (
      professor_id, module_id, academic_year_id,
      teaching_type, priority_level
    ) VALUES (
      ${professorId}, ${pref.moduleId}, ${academicYearId},
      ${pref.teachingType}, ${pref.priorityLevel}
    )
  `;
}
```

### عرض التفضيلات للأستاذ

```typescript
// GET /api/preferences
const preferences = await sql`
  SELECT 
    p.*,
    m.module_name,
    m.semester,
    m.study_level,
    s.name as specialty_name
  FROM preferences p
  JOIN modules m ON p.module_id = m.id
  LEFT JOIN specialties s ON m.specialty_id = s.id
  WHERE p.professor_id = ${professorId}
    AND p.academic_year_id = ${academicYearId}
  ORDER BY m.semester, m.module_name
`;
```

### عرض التفضيلات للإدارة

#### حسب الأستاذ
```typescript
// GET /api/admin/preferences
const preferences = await sql`
  SELECT 
    prof.full_name_latin,
    prof.full_name_arabic,
    prof.department,
    COUNT(p.id) as total_preferences,
    json_agg(
      json_build_object(
        'module_name', m.module_name,
        'teaching_type', p.teaching_type,
        'priority_level', p.priority_level
      )
    ) as modules
  FROM professors prof
  LEFT JOIN preferences p ON prof.user_id = p.professor_id
  LEFT JOIN modules m ON p.module_id = m.id
  WHERE p.academic_year_id = ${academicYearId}
  GROUP BY prof.user_id, prof.full_name_latin, prof.full_name_arabic, prof.department
`;
```

#### حسب المقياس
```typescript
const preferences = await sql`
  SELECT 
    m.module_name,
    m.semester,
    COUNT(p.id) as professor_count,
    json_agg(
      json_build_object(
        'professor_name', prof.full_name_latin,
        'teaching_type', p.teaching_type,
        'priority_level', p.priority_level
      )
    ) as professors
  FROM modules m
  LEFT JOIN preferences p ON m.id = p.module_id
  LEFT JOIN professors prof ON p.professor_id = prof.user_id
  WHERE p.academic_year_id = ${academicYearId}
  GROUP BY m.id, m.module_name, m.semester
`;
```

---

## 👥 6. إدارة المستخدمين {#user-management}

### عرض المستخدمين

```typescript
// GET /api/admin/users
const users = await sql`
  SELECT 
    u.id,
    u.email,
    u.role,
    u.created_at,
    p.full_name_latin,
    p.full_name_arabic,
    p.academic_rank,
    p.department,
    p.profile_completed
  FROM users u
  LEFT JOIN professors p ON u.id = p.user_id
  ORDER BY u.role DESC, p.department, p.full_name_latin
`;
```

### تعديل مستخدم

```typescript
// PUT /api/admin/users/:id
const { fullNameLatin, fullNameArabic, academicRank, department } = await request.json();

await sql`
  UPDATE professors
  SET full_name_latin = ${fullNameLatin},
      full_name_arabic = ${fullNameArabic},
      academic_rank = ${academicRank},
      department = ${department},
      updated_at = CURRENT_TIMESTAMP
  WHERE user_id = ${userId}
`;
```

### تفعيل/تعطيل حساب

```typescript
// PATCH /api/admin/users/:id
await sql`
  UPDATE users
  SET is_active = NOT is_active
  WHERE id = ${userId}
`;
```

### حذف مستخدم

```typescript
// DELETE /api/admin/users/:id
// التحقق من عدم حذف المدير
const user = await sql`SELECT role FROM users WHERE id = ${userId}`;
if (user.role === 'ADMIN') {
  return NextResponse.json({ error: 'Cannot delete admin user' }, { status: 403 });
}

// الحذف (يحذف تلقائياً من professors بسبب CASCADE)
await sql`DELETE FROM users WHERE id = ${userId}`;
```

---

## 📤 7. الاستيراد والتصدير {#import-export}

### استيراد الأساتذة من Excel

```typescript
// POST /api/admin/professors/import
const file = formData.get('file');
const buffer = await file.arrayBuffer();
const workbook = XLSX.read(buffer, { type: 'buffer' });
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

const results = [];
for (const row of data) {
  try {
    // 1. إنشاء/تحديث المستخدم
    const hashedPassword = await bcrypt.hash('Professor@123', 10);
    const user = await sql`
      INSERT INTO users (email, password_hash, role)
      VALUES (${row.Email}, ${hashedPassword}, 'PROFESSOR')
      ON CONFLICT (email) DO UPDATE
        SET updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `;

    // 2. إنشاء/تحديث الملف الشخصي
    await sql`
      INSERT INTO professors (
        user_id, full_name_latin, full_name_arabic,
        academic_rank, professional_email, primary_phone,
        phd_specialization, department, profile_completed
      ) VALUES (
        ${user.id}, ${row['Full Name (Latin)']}, ${row['Full Name (Arabic)']},
        ${row['Academic Rank']}, ${row['Professional Email']}, ${row['Primary Phone']},
        ${row['PhD Specialization']}, ${row.Department}, true
      )
      ON CONFLICT (user_id) DO UPDATE SET
        full_name_latin = ${row['Full Name (Latin)']},
        -- ... other fields
        updated_at = CURRENT_TIMESTAMP
    `;

    results.push({ success: true, email: row.Email });
  } catch (error) {
    results.push({ success: false, email: row.Email, error: error.message });
  }
}

return NextResponse.json({ results });
```

### استيراد المقاييس من Excel

```typescript
// POST /api/admin/modules/bulk
const data = XLSX.utils.sheet_to_json(sheet);

for (const row of data) {
  await sql`
    INSERT INTO modules (
      module_name, study_level, specialty_id,
      semester, is_active_for_current_year
    ) VALUES (
      ${row['Module Name']}, ${row['Study Level']}, ${row['Specialty ID']},
      ${row.Semester}, ${row['Is Active'] === 'TRUE'}
    )
  `;
}
```

### تصدير إلى Excel

```typescript
// مثال: تصدير تقرير
const data = [...]; // البيانات من قاعدة البيانات

// إنشاء worksheet
const ws = XLSX.utils.json_to_sheet(data);

// إنشاء workbook
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Report');

// تحويل إلى buffer
const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

// إرجاع response
return new Response(buffer, {
  headers: {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': `attachment; filename=report_${Date.now()}.xlsx`
  }
});
```

---

## 📊 8. نظام التقارير {#reports-system}

### تم تغطيته بالتفصيل في التقارير الموجودة:
- `REPORTS_SYSTEM.md`
- `PREFERENCES_MATRIX_REPORT_READY.md`
- `ALL_REPORTS_FIX_SUMMARY.md`

---

## 🌍 9. نظام الترجمة {#i18n-system}

### تم تغطيته بالتفصيل في:
- `LANGUAGE_SYSTEM_READY.md`
- `TRANSLATION_COMPLETE_AR.md`
- `I18N_SETUP_INSTRUCTIONS.md`

---

**جميع الميزات موثقة ومطبقة بشكل احترافي!** ⚙️
