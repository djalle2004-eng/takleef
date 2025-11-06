# Admin Dashboard Features

## 1. Statistics Overview (`/admin`)

### Key Metrics Cards
- **Total Professors**: Count of all registered professors
- **Total Modules**: Count of all modules (with active count)
- **Total Preferences**: All submitted preferences
- **Recent Activity**: Preferences submitted in last 7 days

### Charts & Visualizations
- **Preferences by Teaching Type**: Bar chart showing distribution of LECTURE, TUTORIAL, BOTH
- **Most Requested Modules**: Top 5 modules ranked by professor requests
- **Professors by Department**: Grid showing distribution across departments

### Quick Actions
- Navigate to Manage Professors
- Navigate to Manage Modules
- Navigate to View Preferences
- Navigate to Academic Years

## 2. Preferences Management (`/admin/preferences`)

### Features
- **Tabbed View**:
  - **By Professor**: List all professors with their preferences
  - **By Module**: List all modules with requesting professors
  
- **Drill-Down Navigation**: Click to view detailed preferences
- **Export to Excel**: Download complete data as XLSX file
- **Filter by Academic Year**: View preferences for specific years
- **Priority Display**: See professor's priority for each module
- **Teaching Type Display**: محاضرة / أعمال موجهة / كلاهما

### API Endpoints
```
GET /api/admin/preferences?academicYearId={id}
GET /api/admin/preferences?moduleId={id}
GET /api/admin/preferences?professorId={id}
```

## 3. Professor Management (`/admin/users`)

### Features
- **View All Professors**: Complete list with details
- **View Profile**: See full professor information
- **Edit Professor**: Update professor details
- **Activate/Deactivate**: Toggle account status
- **Delete Professor**: Remove professor (with confirmation)
- **Import from Excel**: Bulk import professors

### Import from Excel
- Download template with all required fields
- Upload Excel file (.xlsx, .xls)
- Automatic validation and error reporting
- Updates existing professors or creates new ones
- Default password: `Professor@123` (should be changed on first login)

### Template Fields
- Email (required)
- Full Name (Latin) (required)
- Full Name (Arabic)
- Academic Rank
- Department
- Professional Email
- Personal Email
- Primary Phone
- Secondary Phone
- PhD Specialization
- Field of Research

### API Endpoints
```
GET /api/admin/users
GET /api/admin/users/[id]
PUT /api/admin/users/[id]
PATCH /api/admin/users/[id] (toggle status)
DELETE /api/admin/users/[id]
POST /api/admin/professors/import (bulk import)
```

## 4. Subject/Module Management (`/admin/modules`)

### Features
- **Hierarchical Navigation**: Department → Specialty → Modules
- **Add/Edit/Delete Modules**
- **Toggle Availability**: Bulk activate/deactivate modules
- **Import from Excel**: Bulk import modules
- **Semester Organization**: Modules grouped by semester (S1-S6)

### Import from Excel
- Download template
- Upload Excel file
- Bulk create modules
- Automatic validation

### Template Fields
- Module Name (required)
- Study Level (required): جذع مشترك, ليسانس, ماستر
- Specialty ID
- Semester: S1, S2, S3, S4, S5, S6
- Is Active: TRUE/FALSE

### Bulk Operations
- **Bulk Toggle**: Activate/deactivate multiple modules
- **Bulk Delete**: Remove multiple modules

### API Endpoints
```
GET /api/admin/modules?specialtyId={id}
POST /api/admin/modules
PUT /api/admin/modules/[id]
DELETE /api/admin/modules/[id]
POST /api/admin/modules/bulk (bulk import)
PATCH /api/admin/modules/bulk (bulk toggle)
DELETE /api/admin/modules/bulk?ids=1,2,3 (bulk delete)
```

## 5. Academic Year Management (`/admin/academic-years`)

### Features
- **Create/Edit/Delete Academic Years**
- **Set Active Year**: Only one active year at a time
- **Archive Years**: Mark years as archived
- **View Associated Modules**: See modules for each year

## 6. Statistics API (`/api/admin/statistics`)

### Provides
- Overview counts (professors, modules, preferences)
- Active academic year
- Preferences grouped by teaching type
- Top 5 most requested modules
- Professors by department
- Recent activity (last 7 days)

### Response Structure
```json
{
  "overview": {
    "totalProfessors": 25,
    "totalModules": 150,
    "activeModules": 120,
    "totalPreferences": 300
  },
  "activeYear": { "id": 1, "year_name": "2024-2025" },
  "preferencesByType": [
    { "type": "LECTURE", "count": 100 },
    { "type": "TUTORIAL", "count": 80 },
    { "type": "BOTH", "count": 120 }
  ],
  "topModules": [...],
  "professorsByDepartment": [...],
  "recentActivity": [...]
}
```

## UI Components

### Import Components
1. **ImportProfessors.tsx**: Modal for importing professors from Excel
2. **ImportModules.tsx**: Modal for importing modules from Excel

### Features
- Drag & drop or click to upload
- Download template button
- Real-time import progress
- Success/Error reporting
- Detailed error messages for failed imports

## Technologies Used
- **Next.js 14**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **XLSX**: Excel file processing
- **PostgreSQL**: Database (via @neondatabase/serverless)
- **bcryptjs**: Password hashing

## Security
- All admin routes protected by role-based authentication
- SQL injection protection via parameterized queries
- Password hashing for user accounts
- Session-based authentication

## Future Enhancements (Possible)
- Assignment wizard for auto-assigning professors to modules
- Conflict detection (same professor, same time)
- Email notifications to professors
- Export to PDF reports
- Advanced filtering and search
- Bulk assignment operations
- Teaching load calculation and visualization
