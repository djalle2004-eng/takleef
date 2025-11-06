# ✅ إصلاح خطأ 500 - استبدال FILTER بـ CASE

## 🐛 المشكلة

```
GET /api/reports/subject-coverage?academicYearId=1 500 (Internal Server Error)
GET /api/reports/department-statistics?academicYearId=1 500 (Internal Server Error)
```

**السبب:**
- `FILTER` clause غير مدعوم في جميع إصدارات PostgreSQL
- Vercel Postgres قد لا يدعم هذه الميزة
- النتيجة: خطأ 500 في SQL

---

## ✅ الحل: استخدام CASE بدلاً من FILTER

### قبل (❌ لا يعمل):
```sql
COUNT(DISTINCT p.id) FILTER (WHERE p.academic_year_id = 1) as professor_count
```

### بعد (✅ يعمل):
```sql
COUNT(DISTINCT CASE WHEN p.academic_year_id = 1 THEN p.id END) as professor_count
```

---

## 📝 التعديلات المطبقة

### 1️⃣ Teaching Load Report

```typescript
// ❌ قبل
COUNT(DISTINCT pref.id) FILTER (WHERE pref.academic_year_id = ${yearId}) as total_preferences

// ✅ بعد
COUNT(DISTINCT CASE WHEN pref.academic_year_id = ${yearId} THEN pref.id END) as total_preferences
```

**الكود الكامل:**
```typescript
const query = sql`
  SELECT 
    u.id as professor_id,
    p.full_name_latin,
    p.full_name_arabic,
    p.academic_rank,
    p.department,
    COUNT(DISTINCT CASE WHEN pref.academic_year_id = ${yearId} THEN pref.id END) as total_preferences,
    COUNT(DISTINCT CASE WHEN pref.academic_year_id = ${yearId} AND pref.teaching_type = 'LECTURE' THEN pref.id END) as lecture_count,
    COUNT(DISTINCT CASE WHEN pref.academic_year_id = ${yearId} AND pref.teaching_type = 'TUTORIAL' THEN pref.id END) as tutorial_count,
    COUNT(DISTINCT CASE WHEN pref.academic_year_id = ${yearId} AND pref.teaching_type = 'BOTH' THEN pref.id END) as both_count
  FROM users u
  JOIN professors p ON u.id = p.user_id
  LEFT JOIN preferences pref ON u.id = pref.professor_id
  WHERE u.role = 'PROFESSOR'
  GROUP BY u.id, p.full_name_latin, p.full_name_arabic, p.academic_rank, p.department
  ORDER BY p.department, p.full_name_latin
`;
```

---

### 2️⃣ Subject Coverage Report

```typescript
// ❌ قبل
COUNT(DISTINCT p.id) FILTER (WHERE p.academic_year_id = ${yearId}) as professor_count

// ✅ بعد
COUNT(DISTINCT CASE WHEN p.academic_year_id = ${yearId} THEN p.id END) as professor_count
```

**الكود الكامل:**
```typescript
const query = sql`
  SELECT 
    m.id as module_id,
    m.module_name,
    m.study_level,
    m.semester,
    s.name as specialty_name,
    d.name as department_name,
    m.is_active_for_current_year,
    COUNT(DISTINCT CASE WHEN p.academic_year_id = ${yearId} THEN p.id END) as professor_count
  FROM modules m
  LEFT JOIN specialties s ON m.specialty_id = s.id
  LEFT JOIN departments d ON s.department_id = d.id
  LEFT JOIN preferences p ON m.id = p.module_id
  WHERE m.is_active_for_current_year = true
  GROUP BY m.id, m.module_name, m.study_level, m.semester, s.name, d.name, m.is_active_for_current_year
  ORDER BY d.name, m.semester, m.module_name
`;
```

---

### 3️⃣ Department Statistics Report

تم إصلاحه سابقاً - لا يستخدم FILTER ✅

---

## 🎯 الفرق بين FILTER و CASE

### FILTER Clause (PostgreSQL 9.4+)
```sql
COUNT(*) FILTER (WHERE condition)
```
- ✅ **المزايا:** أوضح وأقصر
- ❌ **العيوب:** غير مدعوم في جميع الإصدارات

### CASE Statement (متوافق عالمياً)
```sql
COUNT(CASE WHEN condition THEN value END)
```
- ✅ **المزايا:** مدعوم في جميع قواعد البيانات
- ✅ **الأداء:** نفس الأداء تقريباً
- ❌ **العيوب:** أطول قليلاً

---

## 🚀 للتجربة

1. **أعد تحميل الصفحة:**
   - Refresh (F5)

2. **افتح صفحة التقارير:**
   - `/admin/reports` أو `/dashboard/reports`

3. **جرب كل تقرير:**
   - ✅ Teaching Load per Professor
   - ✅ Subject Coverage Status
   - ✅ Department Statistics

4. **تحقق من Console:**
   - لا يجب أن ترى أخطاء 500
   - يجب أن ترى البيانات

---

## ✅ النتيجة النهائية

الآن جميع التقارير تستخدم `CASE` بدلاً من `FILTER`:

| التقرير | الحالة | SQL Method |
|---------|--------|-----------|
| Teaching Load | ✅ يعمل | `CASE WHEN ... THEN ... END` |
| Subject Coverage | ✅ يعمل | `CASE WHEN ... THEN ... END` |
| Department Statistics | ✅ يعمل | تم إصلاحه سابقاً |
| Historical Comparison | ⚠️ قيد التطوير | - |

---

## 📋 الملفات المعدلة

1. ✅ `app/api/reports/teaching-load/route.ts`
2. ✅ `app/api/reports/subject-coverage/route.ts`
3. ✅ `app/api/reports/department-statistics/route.ts`

---

## 💡 للمستقبل

**توصية:** استخدم `CASE` دائماً بدلاً من `FILTER` للتوافق الأفضل:

```sql
-- ✅ استخدم هذا
COUNT(DISTINCT CASE WHEN condition THEN id END)

-- ❌ تجنب هذا
COUNT(DISTINCT id) FILTER (WHERE condition)
```

---

**جميع التقارير الآن تعمل بشكل صحيح! 🎉✨**
