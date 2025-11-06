# Semester System Documentation

## Overview
The academic system now has a hierarchical structure where each **Academic Year** contains **two Semesters**, and each **Semester** can contain multiple **Modules**.

```
Academic Year (e.g., 2025-2026)
├── Semester 1
│   ├── Module 1
│   ├── Module 2
│   └── Module 3
└── Semester 2
    ├── Module 4
    ├── Module 5
    └── Module 6
```

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
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Semesters Table (NEW)
```sql
CREATE TABLE semesters (
  id SERIAL PRIMARY KEY,
  semester_name VARCHAR(50) NOT NULL,
  semester_number INTEGER NOT NULL,
  academic_year_id INTEGER REFERENCES academic_years(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(academic_year_id, semester_number)
)
```

### Modules Table (UPDATED)
```sql
CREATE TABLE modules (
  id SERIAL PRIMARY KEY,
  module_name VARCHAR(255) NOT NULL,
  study_level VARCHAR(50) NOT NULL,
  department VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  semester_id INTEGER REFERENCES semesters(id) ON DELETE SET NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**Note:** Modules now link to `semester_id` instead of `academic_year_id`

## Automatic Semester Creation

When you create a new Academic Year, **two semesters are automatically created**:

1. **Semester 1**
   - Start Date: Academic Year start date
   - End Date: Midpoint of academic year

2. **Semester 2**
   - Start Date: Midpoint of academic year
   - End Date: Academic Year end date

### Example
If you create Academic Year "2025-2026" from September 1, 2025 to June 30, 2026:

- **Semester 1**: Sep 1, 2025 → Mar 15, 2026 (approx midpoint)
- **Semester 2**: Mar 15, 2026 → Jun 30, 2026

## Features

### Academic Year Management

#### Expandable View
- Click the chevron icon (▶/▼) next to an academic year name
- Expands to show both semesters
- Each semester displays its date range
- Modules assigned to each semester are listed below

#### Creating Academic Years
1. Click "Add New Year"
2. Fill in year name (e.g., "2025-2026")
3. Select start and end dates
4. Two semesters are **automatically created**
5. No manual semester creation needed

### Modules Management

#### Linking Modules to Semesters
When creating or editing a module:

1. **Module Name** - e.g., "Microéconomie"
2. **Study Level** - Select from dropdown
3. **Department** - Select from dropdown
4. **Semester** (Optional) - Select from dropdown showing:
   - Format: `[Year Name] - [Semester Name]`
   - Example: "2025-2026 - Semester 1"

#### Module Display
Modules table now shows:
- Module Name
- Study Level
- **Semester** (shows semester name)
- Department
- **Academic Year** (automatically from semester)
- Status (Active/Inactive)

## API Endpoints

### Semesters API

#### GET `/api/admin/semesters`
List all semesters

**Query Parameters:**
- `academicYearId` (optional) - Filter by academic year

**Response:**
```json
{
  "semesters": [
    {
      "id": 1,
      "semester_name": "Semester 1",
      "semester_number": 1,
      "academic_year_id": 1,
      "year_name": "2025-2026",
      "start_date": "2025-09-01",
      "end_date": "2026-03-15"
    }
  ]
}
```

### Updated Modules API

#### POST/PUT `/api/admin/modules`
Now accepts `semesterId` instead of `academicYearId`

**Request Body:**
```json
{
  "moduleName": "Microéconomie",
  "studyLevel": "ليسانس",
  "department": "قسم العلوم الاقتصادية",
  "isActive": true,
  "semesterId": 1
}
```

## UI/UX Improvements

### Academic Years Page

**Before:** Simple table with flat academic year list

**Now:** 
- Expandable rows with chevron indicators
- Click to expand and see semesters
- Semesters displayed in nested cards
- Each semester card shows:
  - Semester name and number
  - Date range
  - List of assigned modules (with book icon)
  - "No modules assigned yet" message if empty

### Modules Page

**Before:** Manual semester input field (S1, S2, etc.)

**Now:**
- Dropdown selector showing all available semesters
- Format: "Year - Semester Name"
- Automatically links module to academic year through semester
- Optional field (modules can exist without semester)

## User Workflows

### Creating a Complete Academic Structure

1. **Create Academic Year**
   ```
   Year: 2025-2026
   Start: Sep 1, 2025
   End: Jun 30, 2026
   ```
   ✅ Two semesters auto-created

2. **Add Modules to Semester 1**
   ```
   Module: Microéconomie
   Study Level: ليسانس
   Department: قسم العلوم الاقتصادية
   Semester: 2025-2026 - Semester 1
   ```

3. **Add Modules to Semester 2**
   ```
   Module: Macroéconomie
   Study Level: ليسانس
   Department: قسم العلوم الاقتصادية
   Semester: 2025-2026 - Semester 2
   ```

4. **View Hierarchy**
   - Go to Academic Years page
   - Click expand icon next to "2025-2026"
   - See Semester 1 with Microéconomie
   - See Semester 2 with Macroéconomie

### Moving Module to Different Semester

1. Go to Modules Management
2. Click "Edit" on a module
3. Select different semester from dropdown
4. Click "Update"
5. Module immediately appears under new semester

## Migration Steps

If you have existing data, run these migrations:

```powershell
# Step 1: Create semesters table and auto-generate semesters for existing years
Invoke-WebRequest -Uri http://localhost:3000/api/migrate-semesters -Method POST

# Step 2: Update modules table structure (if needed)
Invoke-WebRequest -Uri http://localhost:3000/api/migrate-modules -Method POST
```

## Benefits

### 1. Better Organization
- Clear two-semester structure per year
- Modules grouped by when they're taught
- Easy to see semester workload

### 2. Automatic Management
- No manual semester creation
- Consistent semester naming
- Automatic date calculation

### 3. Flexible Linking
- Modules can be semester-specific or standalone
- Easy to reassign modules between semesters
- Year information automatically inherited

### 4. Visual Hierarchy
- Expandable interface shows relationships
- Quick overview of year structure
- See modules per semester at a glance

## Future Enhancements

1. **Custom Semester Names**
   - Allow admins to customize semester names
   - Support for trimesters or quarters

2. **Semester Templates**
   - Copy modules from previous year's semester
   - Bulk assign modules

3. **Semester Status**
   - Mark semesters as "Current", "Upcoming", "Past"
   - Filter modules by semester status

4. **Module Prerequisites**
   - Link modules across semesters
   - Show dependency chains

5. **Enrollment Management**
   - Assign students to semesters
   - Track semester progress

## Troubleshooting

### Semesters not showing
- Make sure you've run the migration: `/api/migrate-semesters`
- Click the expand icon (chevron) next to academic year
- Check browser console for errors

### Modules not appearing under semesters
- Verify module has `semester_id` set
- Old modules without semester assignment won't appear
- Edit module and assign to a semester

### Cannot create academic year
- Check dates are valid
- Ensure year name is unique
- Verify database connection

## Summary

The semester system provides:
- ✅ **Automatic** semester creation (2 per year)
- ✅ **Hierarchical** structure (Year → Semester → Module)
- ✅ **Visual** expandable interface
- ✅ **Flexible** module assignment
- ✅ **Organized** academic planning

All existing academic years now have semesters, and new years will automatically get two semesters upon creation!
