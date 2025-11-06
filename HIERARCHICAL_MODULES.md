# Hierarchical Module Management System

## ✅ Implementation Complete!

The module management system now follows a hierarchical structure:

```
Department → Specialty → Semester → Module
```

## Database Schema

### Tables Created
1. **departments** - 5 faculty departments (pre-populated)
2. **specialties** - Specialties with level and department link
3. **modules** - Modules linked to specialties with semester grouping

### Pre-populated Departments
- قسم العلوم الاقتصادية
- قسم العلوم المالية والمحاسبة
- قسم علوم التسيير
- قسم العلوم التجارية
- قسم الجذع المشترك

## Admin Navigation Flow

### 1. Main Page (`/admin/modules`)
- **Shows:** 5 department cards
- **Action:** Click department → navigate to specialties

### 2. Specialties Page (`/admin/modules/department/{id}`)
- **Shows:** All specialties for selected department
- **Features:**
  - Add New Specialty button
  - Edit/Delete specialty
  - View modules per specialty
  - Study level badge (جذع مشترك / ليسانس / ماستر)

### 3. Modules Page (`/admin/modules/specialty/{id}`)
- **Shows:** Modules grouped by semester (S1, S2, etc.)
- **Features:**
  - Add New Module button
  - Edit/Delete module
  - Toggle `is_active_for_current_year` status
  - Visual grouping by semester

## Professor Teaching Preferences

### Access
Navigate to `/dashboard/teaching-preferences`

### Flow
1. **Select Study Level** (طور)
   - جذع مشترك / ليسانس / ماستر

2. **Select Specialty** (التخصص)
   - Shows specialties for selected level

3. **Select Modules** (المقاييس)
   - Modules grouped by semester
   - Checkbox selection
   - Only active modules shown

4. **Save Preferences**
   - Summary of selected modules
   - Save button

## API Endpoints

### Departments
- `GET /api/admin/departments` - List all departments

### Specialties
- `GET /api/admin/specialties?departmentId={id}` - List specialties
- `POST /api/admin/specialties` - Create specialty
- `PUT /api/admin/specialties/{id}` - Update specialty
- `DELETE /api/admin/specialties/{id}` - Delete specialty

### Modules
- `GET /api/admin/modules?specialtyId={id}` - List modules
- `POST /api/admin/modules` - Create module
- `PUT /api/admin/modules/{id}` - Update module
- `DELETE /api/admin/modules/{id}` - Delete module

## Module Fields

```typescript
{
  id: number;
  module_name: string;
  study_level: 'جذع مشترك' | 'ليسانس' | 'ماستر';
  semester: string; // e.g., "S1", "S2"
  specialty_id: number;
  is_active_for_current_year: boolean;
}
```

## Specialty Fields

```typescript
{
  id: number;
  name: string;
  level: 'جذع مشترك' | 'ليسانس' | 'ماستر';
  department_id: number;
}
```

## UI Features

### Admin Module Management
- ✅ Card-based department grid
- ✅ Specialty cards with module count
- ✅ Semester-grouped module display
- ✅ Inline edit/delete actions
- ✅ Toggle active status with visual indicators
- ✅ Modal forms for add/edit
- ✅ Back navigation breadcrumbs

### Professor Preferences
- ✅ Step-by-step selection wizard
- ✅ Visual level selection cards
- ✅ Specialty filtering by level
- ✅ Checkbox module selection
- ✅ Semester grouping
- ✅ Selected modules summary
- ✅ Save functionality

## Migration Complete

Database has been migrated with:
- ✅ Departments table with 5 departments
- ✅ Specialties table
- ✅ Modules updated with specialty_id
- ✅ is_active_for_current_year field
- ✅ Semester field

## Testing Flow

### As Admin:
1. Visit `/admin/modules`
2. Click on a department
3. Add a specialty (e.g., "علوم اقتصادية" for ليسانس level)
4. Click on the specialty
5. Add modules with semester assignments (S1, S2, etc.)
6. Toggle module active status
7. Edit/delete as needed

### As Professor:
1. Visit `/dashboard/teaching-preferences`
2. Select study level
3. Select specialty
4. Choose modules from semester groups
5. Save preferences

## Benefits

1. **Organized Hierarchy** - Clear structure from department to module
2. **Flexible Management** - Easy CRUD at each level
3. **Semester Grouping** - Visual organization by semester
4. **Active Status** - Toggle which modules are available
5. **Professor-Friendly** - Intuitive selection process
6. **Scalable** - Easy to add more departments/specialties

## Notes

- Deleting a department cascades to specialties and modules
- Deleting a specialty cascades to its modules
- Only active modules appear in professor preferences
- Semester field is flexible (S1, S2, S3, etc.)
