# CRUD Features Documentation

## Overview
Complete CRUD (Create, Read, Update, Delete) functionality for Academic Years and Modules management in the admin dashboard.

## Academic Year Management

### Features
- ✅ **Create** new academic years
- ✅ **Edit** existing academic years
- ✅ **Delete** academic years
- ✅ **Archive/Unarchive** academic years
- ✅ **Set Active Year** (only one can be active at a time)

### Academic Year Fields
- **Year Name** (required) - e.g., "2025-2026"
- **Start Date** (required) - Academic year start date
- **End Date** (required) - Academic year end date
- **Is Active** (checkbox) - Mark as current active year
- **Is Archived** (automatic) - Archive old years

### API Endpoints

#### GET `/api/admin/academic-years`
List all academic years

**Response:**
```json
{
  "academicYears": [
    {
      "id": 1,
      "year_name": "2025-2026",
      "start_date": "2025-09-01",
      "end_date": "2026-06-30",
      "is_active": true,
      "is_archived": false
    }
  ]
}
```

#### POST `/api/admin/academic-years`
Create a new academic year

**Request Body:**
```json
{
  "yearName": "2025-2026",
  "startDate": "2025-09-01",
  "endDate": "2026-06-30",
  "isActive": true
}
```

#### PUT `/api/admin/academic-years/:id`
Update an existing academic year

**Request Body:** Same as POST

#### DELETE `/api/admin/academic-years/:id`
Delete an academic year

#### PATCH `/api/admin/academic-years/:id`
Archive/Unarchive an academic year

**Request Body:**
```json
{
  "isArchived": true
}
```

### UI Features
- **Modal Form** - Popup form for add/edit
- **Table View** - List all academic years with status badges
- **Active Indicator** - Green badge for active year
- **Archive Status** - Grayed out archived years
- **Confirmation Dialogs** - Confirm before delete
- **Real-time Updates** - Table refreshes after changes

---

## Modules Management

### Features
- ✅ **Create** new modules
- ✅ **Edit** existing modules
- ✅ **Delete** modules
- ✅ **Filter by Academic Year**
- ✅ **Set Active Status** for current year
- ✅ **Link to Academic Years**

### Module Fields
- **Module Name** (required) - e.g., "Microéconomie"
- **Study Level** (required dropdown):
  - جذع مشترك (Common Core)
  - ليسانس (Bachelor's)
  - ماستر (Master's)
- **Semester** (required) - e.g., "S1", "S2", "S3"
- **Department** (required dropdown):
  - قسم العلوم الاقتصادية
  - قسم العلوم المالية والمحاسبة
  - قسم علوم التسيير
  - قسم العلوم التجارية
  - قسم الجذع المشترك
- **Academic Year** (optional) - Link module to specific year
- **Is Active** (checkbox) - Active for current academic year

### API Endpoints

#### GET `/api/admin/modules`
List all modules

**Query Parameters:**
- `academicYearId` (optional) - Filter by academic year

**Response:**
```json
{
  "modules": [
    {
      "id": 1,
      "module_name": "Microéconomie",
      "study_level": "ليسانس",
      "semester": "S1",
      "department": "قسم العلوم الاقتصادية",
      "is_active": true,
      "academic_year_id": 1,
      "year_name": "2025-2026"
    }
  ]
}
```

#### POST `/api/admin/modules`
Create a new module

**Request Body:**
```json
{
  "moduleName": "Microéconomie",
  "studyLevel": "ليسانس",
  "semester": "S1",
  "department": "قسم العلوم الاقتصادية",
  "isActive": true,
  "academicYearId": 1
}
```

#### PUT `/api/admin/modules/:id`
Update an existing module

**Request Body:** Same as POST

#### DELETE `/api/admin/modules/:id`
Delete a module

### UI Features
- **Modal Form** - Popup form for add/edit with all fields
- **Table View** - List all modules with details
- **RTL Support** - Arabic text displayed right-to-left
- **Active Indicator** - Green badge for active modules
- **Academic Year Display** - Shows linked year name
- **Dropdown Selects** - Easy selection for study level and department
- **Confirmation Dialogs** - Confirm before delete

---

## Database Schema

### Academic Years Table
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
)
```

### Modules Table (Updated)
```sql
CREATE TABLE modules (
  id SERIAL PRIMARY KEY,
  module_name VARCHAR(255) NOT NULL,
  study_level VARCHAR(50) NOT NULL,
  semester VARCHAR(10) NOT NULL,
  department VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  academic_year_id INTEGER REFERENCES academic_years(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Note:** The old fields `module_code`, `module_name_arabic`, `module_name_english`, and `credits` have been removed.

---

## Validation Rules

### Academic Year Validation
```typescript
{
  yearName: string (required),
  startDate: string (required, date format),
  endDate: string (required, date format),
  isActive: boolean (optional)
}
```

### Module Validation
```typescript
{
  moduleName: string (required),
  studyLevel: enum (required) ['جذع مشترك', 'ليسانس', 'ماستر'],
  semester: string (required),
  department: enum (required) [departments list],
  isActive: boolean (optional),
  academicYearId: number (optional)
}
```

---

## Business Logic

### Active Year Rules
1. **Only one active year** - When setting a year as active, all others are automatically set to inactive
2. **Archived years cannot be active** - Archiving a year automatically deactivates it
3. **Active year indicator** - Visual green badge in UI

### Module Management Rules
1. **Modules can exist without academic year** - Optional linking
2. **Active status** - Mark modules as active/inactive for current year
3. **Department grouping** - Modules organized by department in display
4. **Academic year filtering** - Can filter modules by specific year

---

## User Workflow

### Creating an Academic Year
1. Click "Add New Year" button
2. Fill in year name (e.g., "2025-2026")
3. Select start and end dates
4. Optionally check "Set as active year"
5. Click "Create"
6. Modal closes and table updates

### Creating a Module
1. Click "Add New Module" button
2. Enter module name
3. Select study level from dropdown (Arabic)
4. Enter semester (e.g., "S1")
5. Select department from dropdown (Arabic)
6. Optionally select academic year
7. Check "Active for current academic year" if applicable
8. Click "Create"
9. Modal closes and table updates

### Editing
1. Click "Edit" button on any row
2. Modal opens with pre-filled data
3. Modify fields as needed
4. Click "Update"
5. Changes reflected immediately

### Deleting
1. Click "Delete" button
2. Confirm deletion in dialog
3. Record removed from table

### Archiving Academic Years
1. Click "Archive" button on a year
2. Year marked as archived and deactivated
3. Click "Unarchive" to restore

---

## Components

### Client Components
- `AcademicYearsManager.tsx` - Full CRUD UI for academic years
- `ModulesManager.tsx` - Full CRUD UI for modules

### Features
- **React Hooks** - useState, useEffect for state management
- **Modal Forms** - Overlay forms for add/edit operations
- **Real-time Updates** - Fetch data after mutations
- **Error Handling** - Try-catch blocks for API calls
- **Loading States** - Show loading spinner during fetch
- **Form Validation** - Client-side validation before submit

---

## Security

### Authentication
- All endpoints require ADMIN role
- JWT token verification on every request
- Unauthorized requests return 401

### Authorization
```typescript
const user = await getCurrentUser();
if (!user || !isAdmin(user)) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Input Validation
- Zod schemas validate all input
- Server-side validation prevents invalid data
- Type-safe with TypeScript

---

## Testing the Features

### Test Academic Years
1. Visit `http://localhost:3000/admin/academic-years`
2. Click "Add New Year"
3. Create year "2025-2026" from Sep 1, 2025 to Jun 30, 2026
4. Set as active
5. Create another year "2024-2025"
6. Notice first year is now inactive
7. Edit a year to change dates
8. Archive an old year
9. Delete a test year

### Test Modules
1. Visit `http://localhost:3000/admin/modules`
2. Click "Add New Module"
3. Create module "Microéconomie"
4. Select "ليسانس" (Bachelor's)
5. Enter semester "S1"
6. Select department "قسم العلوم الاقتصادية"
7. Link to an academic year
8. Check "Active for current academic year"
9. Create module
10. Edit module to change details
11. Delete a test module

---

## Troubleshooting

### Sidebar not showing
Make sure `lucide-react` is installed and dev server restarted after running `npm install`.

### Database errors
Run the migrations:
```powershell
Invoke-WebRequest -Uri http://localhost:3000/api/migrate-db -Method POST
Invoke-WebRequest -Uri http://localhost:3000/api/migrate-modules -Method POST
```

### Cannot create/edit items
1. Check you're signed in as admin
2. Check browser console for errors
3. Verify database is connected

### Arabic text not displaying correctly
The UI has `dir="rtl"` attributes for Arabic fields. Ensure browser supports RTL text direction.

---

## Future Enhancements

1. **Bulk Operations** - Delete/archive multiple items at once
2. **Export Data** - Export modules list to CSV/PDF
3. **Import Modules** - Bulk import from spreadsheet
4. **Module Assignments** - Assign professors to modules
5. **Search & Filter** - Search modules by name, filter by multiple criteria
6. **Pagination** - For large datasets
7. **Sorting** - Click column headers to sort
8. **Module Duplication** - Copy module for new year
9. **Version History** - Track changes to modules
10. **Notifications** - Email notifications for changes

---

## File Structure

```
app/
├── api/
│   └── admin/
│       ├── academic-years/
│       │   ├── route.ts          # GET, POST
│       │   └── [id]/route.ts     # PUT, DELETE, PATCH
│       └── modules/
│           ├── route.ts          # GET, POST
│           └── [id]/route.ts     # PUT, DELETE
components/
├── AcademicYearsManager.tsx      # Academic years UI
└── ModulesManager.tsx            # Modules UI
lib/
└── validations.ts                # Zod schemas
```

## Summary

The CRUD system provides complete management capabilities for:
- ✅ Academic Years with archive functionality
- ✅ Modules with study levels and departmental organization
- ✅ Full create, read, update, delete operations
- ✅ Modern, responsive UI with modals
- ✅ Real-time updates
- ✅ Arabic language support
- ✅ Secure admin-only access
- ✅ Type-safe with TypeScript and Zod validation
