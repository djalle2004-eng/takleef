# 🗄️ تحليل قاعدة البيانات - مشروع Takleef

## نظرة عامة على قاعدة البيانات

```yaml
نوع القاعدة: PostgreSQL (Neon Serverless)
عدد الجداول: 10 جداول رئيسية
العلاقات: 1:1, 1:N, N:1
المحركات: PostgreSQL 14+
الاتصال: @neondatabase/serverless
```

---

## 📊 الجداول بالتفصيل

### 1. users (جدول المستخدمين)

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'PROFESSOR',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**الغرض:** تخزين بيانات المصادقة للمستخدمين

**الحقول:**
- `id`: المعرف الفريد (مفتاح أساسي)
- `email`: البريد الإلكتروني (فريد، إجباري)
- `password_hash`: كلمة المرور المشفرة (bcrypt)
- `role`: الدور (`ADMIN` أو `PROFESSOR`)
- `created_at`: تاريخ الإنشاء
- `updated_at`: تاريخ آخر تحديث

**القيود:**
- ✅ البريد يجب أن يكون `@univ-eloued.dz`
- ✅ الدور الافتراضي: `PROFESSOR`
- ✅ Admin واحد فقط: `hussain-ali@univ-eloued.dz`

**الاستعلامات الشائعة:**
```sql
-- تسجيل دخول
SELECT id, email, password_hash, role 
FROM users 
WHERE email = $1;

-- جلب جميع الأساتذة
SELECT u.*, p.*
FROM users u
JOIN professors p ON u.id = p.user_id
WHERE u.role = 'PROFESSOR';
```

---

### 2. password_reset_tokens (رموز استعادة كلمة المرور)

```sql
CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**الغرض:** إدارة رموز استعادة كلمة المرور

**الحقول:**
- `user_id`: ربط بالمستخدم
- `token`: الرمز الفريد (UUID)
- `expires_at`: تاريخ انتهاء الصلاحية (ساعة واحدة)

**السلوك:**
- ✅ حذف تلقائي عند حذف المستخدم (`ON DELETE CASCADE`)
- ✅ صلاحية الرمز: ساعة واحدة
- ✅ رمز واحد لكل مستخدم

---

### 3. professors (معلومات الأساتذة)

```sql
CREATE TABLE professors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name_arabic VARCHAR(255) NOT NULL,
  full_name_latin VARCHAR(255) NOT NULL,
  academic_rank VARCHAR(100) NOT NULL,
  professional_email VARCHAR(255) NOT NULL,
  personal_email VARCHAR(255),
  primary_phone VARCHAR(50) NOT NULL,
  secondary_phone VARCHAR(50),
  phd_specialization TEXT NOT NULL,
  field_of_research TEXT,
  department VARCHAR(255) NOT NULL,
  profile_completed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**الغرض:** تخزين المعلومات التفصيلية للأساتذة

**العلاقة:** 1:1 مع `users` (كل مستخدم له ملف واحد)

**الرتب الأكاديمية المتاحة:**
- Professor (أستاذ)
- Associate Professor A (أستاذ مشارك أ)
- Associate Professor B (أستاذ مشارك ب)
- Assistant Professor A (أستاذ مساعد أ)
- Assistant Professor B (أستاذ مساعد ب)

**الأقسام المتاحة:**
- قسم العلوم الاقتصادية
- قسم العلوم المالية والمحاسبة
- قسم علوم التسيير
- قسم العلوم التجارية
- قسم الجذع المشترك

**الاستعلامات الشائعة:**
```sql
-- جلب ملف أستاذ
SELECT * FROM professors WHERE user_id = $1;

-- جلب أساتذة قسم معين
SELECT * FROM professors WHERE department = $1;

-- إحصائيات الأساتذة حسب القسم
SELECT department, COUNT(*) as count
FROM professors
GROUP BY department;
```

---

### 4. academic_years (السنوات الأكاديمية)

```sql
CREATE TABLE academic_years (
  id SERIAL PRIMARY KEY,
  year_name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**الغرض:** إدارة السنوات الأكاديمية

**القيود:**
- ✅ سنة نشطة واحدة فقط (`is_active = true`)
- ✅ السنوات المؤرشفة لا يمكن تنشيطها
- ✅ تواريخ البداية والنهاية إجبارية

**مثال البيانات:**
```sql
INSERT INTO academic_years VALUES
(1, '2024-2025', '2024-09-01', '2025-06-30', true, false),
(2, '2025-2026', '2025-09-01', '2026-06-30', false, false);
```

**Logic:**
```sql
-- عند تفعيل سنة جديدة
UPDATE academic_years SET is_active = false WHERE id != $1;
UPDATE academic_years SET is_active = true WHERE id = $1;
```

---

### 5. semesters (الفصول الدراسية)

```sql
CREATE TABLE semesters (
  id SERIAL PRIMARY KEY,
  semester_name VARCHAR(50) NOT NULL,
  semester_number INTEGER NOT NULL,
  academic_year_id INTEGER REFERENCES academic_years(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(academic_year_id, semester_number)
);
```

**الغرض:** تقسيم السنة الأكاديمية إلى فصلين

**العلاقة:** N:1 مع `academic_years` (كل سنة لها فصلان)

**الإنشاء التلقائي:**
عند إضافة سنة أكاديمية جديدة، يتم إنشاء فصلين تلقائياً:

```typescript
// Semester 1
{
  semester_name: 'Semester 1',
  semester_number: 1,
  start_date: academic_year.start_date,
  end_date: midpoint // نقطة منتصف السنة
}

// Semester 2
{
  semester_name: 'Semester 2',
  semester_number: 2,
  start_date: midpoint,
  end_date: academic_year.end_date
}
```

**الاستعلامات:**
```sql
-- جلب فصول سنة معينة
SELECT * FROM semesters 
WHERE academic_year_id = $1 
ORDER BY semester_number;
```

---

### 6. departments (الأقسام)

```sql
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**الغرض:** تخزين الأقسام الخمسة للكلية

**البيانات الثابتة (Pre-populated):**
```sql
INSERT INTO departments (name) VALUES
('قسم العلوم الاقتصادية'),
('قسم العلوم المالية والمحاسبة'),
('قسم علوم التسيير'),
('قسم العلوم التجارية'),
('قسم الجذع المشترك');
```

**ملاحظة:** هذه الأقسام ثابتة ولا يتم تعديلها

---

### 7. specialties (التخصصات)

```sql
CREATE TABLE specialties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  level VARCHAR(50) NOT NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**الغرض:** تخزين تخصصات كل قسم

**العلاقة:** N:1 مع `departments`

**المستويات المتاحة:**
- `جذع مشترك` (Common Core)
- `ليسانس` (Bachelor's)
- `ماستر` (Master's)

**مثال البيانات:**
```sql
INSERT INTO specialties VALUES
(1, 'علوم اقتصادية', 'ليسانس', 1),
(2, 'اقتصاد وتسيير المؤسسة', 'ليسانس', 1),
(3, 'تجارة دولية', 'ماستر', 4);
```

**الاستعلامات:**
```sql
-- جلب تخصصات قسم معين
SELECT s.*, d.name as department_name
FROM specialties s
JOIN departments d ON s.department_id = d.id
WHERE s.department_id = $1;

-- جلب تخصصات مستوى معين
SELECT * FROM specialties WHERE level = 'ليسانس';
```

---

### 8. modules (المقاييس)

```sql
CREATE TABLE modules (
  id SERIAL PRIMARY KEY,
  module_name VARCHAR(255) NOT NULL,
  study_level VARCHAR(50) NOT NULL,
  semester VARCHAR(10),
  specialty_id INTEGER REFERENCES specialties(id) ON DELETE CASCADE,
  semester_id INTEGER REFERENCES semesters(id) ON DELETE SET NULL,
  is_active_for_current_year BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**الغرض:** تخزين المقاييس (المواد الدراسية)

**العلاقات:**
- N:1 مع `specialties` (كل مقياس ينتمي لتخصص)
- N:1 مع `semesters` (اختياري)

**الحقول:**
- `semester`: الفصل الدراسي (S1, S2, S3, S4, S5, S6)
- `is_active_for_current_year`: هل المقياس نشط للسنة الحالية؟

**مثال البيانات:**
```sql
INSERT INTO modules VALUES
(1, 'الاقتصاد الجزئي', 'ليسانس', 'S1', 1, NULL, true),
(2, 'الرياضيات المالية', 'ليسانس', 'S2', 2, NULL, true),
(3, 'التجارة الدولية', 'ماستر', 'S1', 3, NULL, true);
```

**الاستعلامات:**
```sql
-- جلب مقاييس تخصص معين
SELECT m.*, s.name as specialty_name
FROM modules m
JOIN specialties s ON m.specialty_id = s.id
WHERE m.specialty_id = $1
ORDER BY m.semester, m.module_name;

-- جلب المقاييس النشطة فقط
SELECT * FROM modules 
WHERE is_active_for_current_year = true;

-- جلب مقاييس حسب الفصل الدراسي
SELECT * FROM modules 
WHERE semester = 'S1' AND specialty_id = $1;
```

---

### 9. preferences (تفضيلات الأساتذة)

```sql
CREATE TABLE preferences (
  id SERIAL PRIMARY KEY,
  professor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
  academic_year_id INTEGER REFERENCES academic_years(id) ON DELETE CASCADE,
  teaching_type VARCHAR(20) NOT NULL,
  priority_level INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(professor_id, module_id, academic_year_id)
);
```

**الغرض:** تخزين رغبات الأساتذة التدريسية

**العلاقات:**
- N:1 مع `users` (professor_id)
- N:1 مع `modules`
- N:1 مع `academic_years`

**أنواع التدريس:**
- `LECTURE`: محاضرات فقط
- `TUTORIAL`: أعمال موجهة فقط
- `BOTH`: محاضرات + أعمال موجهة

**مستويات الأولوية:**
- `1`: أولوية قصوى
- `2`: أولوية عالية
- `3`: أولوية متوسطة (افتراضي)
- `4`: أولوية منخفضة
- `5`: أولوية ضعيفة

**القيود:**
- ✅ لا يمكن للأستاذ اختيار نفس المقياس مرتين في نفس السنة
- ✅ `UNIQUE(professor_id, module_id, academic_year_id)`

**الاستعلامات:**
```sql
-- جلب رغبات أستاذ معين
SELECT p.*, m.module_name, m.semester
FROM preferences p
JOIN modules m ON p.module_id = m.id
WHERE p.professor_id = $1 AND p.academic_year_id = $2;

-- جلب الأساتذة المهتمين بمقياس معين
SELECT p.*, prof.full_name_latin
FROM preferences p
JOIN professors prof ON p.professor_id = prof.user_id
WHERE p.module_id = $1 AND p.academic_year_id = $2;

-- إحصائيات التفضيلات حسب نوع التدريس
SELECT teaching_type, COUNT(*) as count
FROM preferences
WHERE academic_year_id = $1
GROUP BY teaching_type;
```

---

## 🔗 مخطط العلاقات (ER Diagram)

```
┌─────────────┐
│    users    │
│   (Auth)    │
└──────┬──────┘
       │ 1:1
       │
┌──────▼──────────┐
│   professors    │
│  (Profile Info) │
└─────────────────┘

┌─────────────────┐
│ academic_years  │
└────────┬────────┘
         │ 1:N
    ┌────▼────┐
    │semesters│
    └─────────┘

┌─────────────┐
│departments  │
└──────┬──────┘
       │ 1:N
┌──────▼──────┐
│specialties  │
└──────┬──────┘
       │ 1:N
┌──────▼──────┐
│  modules    │
└──────┬──────┘
       │
       │ N:1
       │
┌──────▼───────────┐
│  preferences     │
│ (N:1 with users) │
│ (N:1 with years) │
└──────────────────┘
```

---

## 📈 استعلامات التقارير

### 1. Teaching Load per Professor

```sql
SELECT 
  u.id as professor_id,
  p.full_name_latin,
  p.full_name_arabic,
  p.academic_rank,
  p.department,
  COUNT(DISTINCT pref.id) FILTER (
    WHERE pref.academic_year_id = $1
  ) as total_preferences,
  COUNT(DISTINCT pref.id) FILTER (
    WHERE pref.teaching_type = 'LECTURE' AND pref.academic_year_id = $1
  ) as lecture_count,
  COUNT(DISTINCT pref.id) FILTER (
    WHERE pref.teaching_type = 'TUTORIAL' AND pref.academic_year_id = $1
  ) as tutorial_count,
  COUNT(DISTINCT pref.id) FILTER (
    WHERE pref.teaching_type = 'BOTH' AND pref.academic_year_id = $1
  ) as both_count
FROM users u
JOIN professors p ON u.id = p.user_id
LEFT JOIN preferences pref ON u.id = pref.professor_id
WHERE u.role = 'PROFESSOR'
GROUP BY u.id, p.full_name_latin, p.full_name_arabic, p.academic_rank, p.department
ORDER BY p.department, p.full_name_latin;
```

### 2. Subject Coverage Status

```sql
SELECT 
  m.id as module_id,
  m.module_name,
  m.semester,
  m.study_level,
  s.name as specialty_name,
  d.name as department_name,
  COUNT(DISTINCT p.id) FILTER (
    WHERE p.academic_year_id = $1
  ) as professor_count
FROM modules m
LEFT JOIN specialties s ON m.specialty_id = s.id
LEFT JOIN departments d ON s.department_id = d.id
LEFT JOIN preferences p ON m.id = p.module_id
WHERE m.is_active_for_current_year = true
GROUP BY m.id, m.module_name, m.semester, m.study_level, s.name, d.name
ORDER BY d.name, m.semester, m.module_name;
```

### 3. Department Statistics

```sql
-- Professors by Department
SELECT p.department, COUNT(*) as professor_count
FROM professors p
JOIN users u ON p.user_id = u.id
WHERE u.role = 'PROFESSOR'
GROUP BY p.department;

-- Modules by Department
SELECT d.name as department, COUNT(m.id) as module_count
FROM departments d
LEFT JOIN specialties s ON d.id = s.department_id
LEFT JOIN modules m ON s.id = m.specialty_id
WHERE m.is_active_for_current_year = true
GROUP BY d.name;

-- Preferences by Department
SELECT p.department, COUNT(pref.id) as preference_count
FROM professors p
JOIN preferences pref ON p.user_id = pref.professor_id
WHERE pref.academic_year_id = $1
GROUP BY p.department;
```

### 4. Preferences Matrix

```sql
-- جلب جميع الأساتذة
SELECT u.id as professor_id, p.full_name_latin, p.full_name_arabic, 
       p.academic_rank, p.department
FROM users u
JOIN professors p ON u.id = p.user_id
WHERE u.role = 'PROFESSOR'
ORDER BY p.department, p.full_name_latin;

-- جلب المقاييس النشطة
SELECT m.id as module_id, m.module_name, m.study_level, m.semester,
       s.name as specialty_name, d.name as department_name
FROM modules m
LEFT JOIN specialties s ON m.specialty_id = s.id
LEFT JOIN departments d ON s.department_id = d.id
WHERE m.is_active_for_current_year = true
ORDER BY d.name, m.semester, m.module_name;

-- جلب الرغبات
SELECT pref.professor_id, pref.module_id, pref.teaching_type, pref.priority_level
FROM preferences pref
WHERE pref.academic_year_id = $1;
```

---

## 🔧 عمليات الصيانة

### إعادة بناء الفهارس
```sql
REINDEX TABLE users;
REINDEX TABLE professors;
REINDEX TABLE preferences;
```

### تنظيف الرموز المنتهية
```sql
DELETE FROM password_reset_tokens 
WHERE expires_at < NOW();
```

### إحصائيات الجداول
```sql
SELECT 
  schemaname,
  tablename,
  n_live_tup as row_count,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🔐 الأمان على مستوى قاعدة البيانات

### Parameterized Queries
```typescript
// ✅ صحيح
await sql`SELECT * FROM users WHERE id = ${userId}`;

// ❌ خطأ (SQL Injection)
await sql`SELECT * FROM users WHERE id = '${userId}'`;
```

### ON DELETE Behaviors
```yaml
CASCADE: حذف السجلات المرتبطة
  - users → professors
  - users → password_reset_tokens
  - academic_years → semesters
  - departments → specialties → modules

SET NULL: تعيين null للحقل المرتبط
  - semesters → modules (semester_id)
```

---

**قاعدة البيانات مصممة بشكل احترافي ومحسنة للأداء!** 🗄️
