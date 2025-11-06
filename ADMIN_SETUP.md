# Admin Dashboard Setup Guide

## Overview
The admin dashboard provides a centralized interface for managing the university portal system. Only users with the ADMIN role can access this dashboard.

## Admin User Credentials

**Email:** hussain-ali@univ-eloued.dz  
**Password:** Aida@miral1981**  
**Role:** ADMIN

## Setup Instructions

### 1. Install Dependencies
After adding the admin feature, you need to install the new dependencies:

```bash
npm install
```

This will install `lucide-react` for the admin sidebar icons.

### 2. Initialize Database with New Schema
The database schema has been updated to include:
- `role` field in the `users` table
- `academic_years` table
- `modules` table

Run the database initialization:

```bash
# Visit in browser after starting the dev server
http://localhost:3000/api/init-db
```

### 3. Create the Admin User
After initializing the database, create the admin user:

```bash
# Make a POST request or visit in browser
http://localhost:3000/api/init-admin
```

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/init-admin
```

**Response:**
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "email": "hussain-ali@univ-eloued.dz"
}
```

### 4. Sign In as Admin
1. Visit `http://localhost:3000/signin`
2. Enter the admin credentials
3. You will be automatically redirected to `/admin` dashboard

## Admin Dashboard Features

### Dashboard (Home)
- **URL:** `/admin`
- **Features:**
  - System statistics overview
  - Total users count
  - Professors count
  - Academic years count
  - Modules count
  - Visual dashboard with colored stat cards

### Academic Year Management
- **URL:** `/admin/academic-years`
- **Features:**
  - View all academic years
  - See year name, start/end dates
  - Active/Inactive status badges
  - Add new academic year (UI ready)
  - Edit/Delete functionality (UI ready)

**Database Schema:**
```sql
CREATE TABLE academic_years (
  id SERIAL PRIMARY KEY,
  year_name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Modules Management
- **URL:** `/admin/modules`
- **Features:**
  - View all course modules
  - Module code, names (Arabic & English)
  - Credits and semester information
  - Department grouping
  - Add new module (UI ready)
  - Edit/Delete functionality (UI ready)

**Database Schema:**
```sql
CREATE TABLE modules (
  id SERIAL PRIMARY KEY,
  module_code VARCHAR(50) UNIQUE NOT NULL,
  module_name_arabic VARCHAR(255) NOT NULL,
  module_name_english VARCHAR(255) NOT NULL,
  credits INTEGER NOT NULL,
  semester INTEGER NOT NULL,
  department VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### User Management
- **URL:** `/admin/users`
- **Features:**
  - View all system users
  - See user profiles (Arabic & Latin names)
  - Email addresses
  - Role badges (ADMIN/PROFESSOR)
  - Department information
  - Join dates
  - Add new user (UI ready)
  - View/Delete functionality (UI ready)
  - Admin users cannot be deleted

## Role-Based Access Control

### Roles
- **ADMIN:** Full access to admin dashboard and all features
- **PROFESSOR:** Access to regular dashboard and profile features

### Middleware Protection
The middleware (`middleware.ts`) implements the following rules:

1. **Admin Routes (`/admin/*`)**
   - Requires authentication
   - Requires ADMIN role
   - Non-admin users are redirected to `/dashboard`
   - Unauthenticated users redirected to `/signin`

2. **Auth Routes (`/signin`, `/signup`)**
   - Admin users automatically redirected to `/admin`
   - Professor users redirected to `/dashboard`

3. **Protected Routes (`/dashboard`, `/complete-profile`)**
   - Requires authentication
   - Regular professors can access
   - Admins can also access but typically use `/admin`

## Admin Dashboard Navigation

The sidebar provides easy navigation between sections:

- **Dashboard** (Home icon) - System overview
- **Academic Year Management** (Calendar icon) - Manage academic years
- **Modules Management** (Book icon) - Manage course modules
- **User Management** (Users icon) - Manage system users
- **Sign Out** (Logout icon) - Sign out from admin panel

### Sidebar Features
- Active route highlighting
- Icon-based navigation
- Responsive design
- Dark theme
- Fixed positioning
- Sign out button in footer

## API Endpoints

### POST `/api/init-admin`
Creates the admin user with predefined credentials.

**Response (Success):**
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "email": "hussain-ali@univ-eloued.dz"
}
```

**Response (Already Exists):**
```json
{
  "success": false,
  "message": "Admin user already exists"
}
```

### Admin Authentication
When the admin user signs in:
1. JWT token includes `role: "ADMIN"`
2. Middleware checks role for admin routes
3. Admin layout verifies role on server side
4. Redirects to `/admin` instead of `/dashboard`

## Security Features

1. **Server-Side Role Verification**
   - Admin layout checks role before rendering
   - Middleware protects all admin routes
   - Cannot bypass via client-side manipulation

2. **JWT Token Role**
   - Role included in JWT payload
   - Token signed with secret key
   - Verified on every protected route

3. **Database Role Field**
   - Role stored in users table
   - Defaults to PROFESSOR for new signups
   - ADMIN must be set manually via init-admin endpoint

4. **Protected Admin Creation**
   - Admin user created via dedicated endpoint
   - Email hardcoded in endpoint (hussain-ali@univ-eloued.dz)
   - Cannot create admin via normal signup

## UI/UX Features

### Design
- Modern, clean interface
- Dark sidebar with light content area
- Consistent color scheme (Indigo primary)
- Responsive tables
- Role-based badges
- Status indicators

### Tables
- Sortable columns (ready for implementation)
- Responsive overflow
- Hover effects
- Action buttons (Edit/Delete/View)
- Empty state messages
- Dark mode support

### Components
- **AdminSidebar:** Reusable navigation component
- **AdminLayout:** Wraps all admin pages with authentication
- Server-side rendering for data tables
- Client-side interactivity for navigation

## Next Steps for Full Implementation

The admin dashboard UI is complete. To add full CRUD functionality:

1. **Create API Routes:**
   - POST `/api/admin/academic-years` - Create academic year
   - PUT `/api/admin/academic-years/:id` - Update academic year
   - DELETE `/api/admin/academic-years/:id` - Delete academic year
   - Similar routes for modules and users

2. **Add Modal Forms:**
   - Create modal components for add/edit forms
   - Form validation with Zod schemas
   - Success/error notifications

3. **Implement Actions:**
   - Connect Edit/Delete buttons to API
   - Add confirmation dialogs for deletions
   - Refresh data after mutations

4. **Add Filtering & Search:**
   - Search by name, email, code
   - Filter by department, semester, status
   - Pagination for large datasets

## Troubleshooting

### "Cannot find module 'lucide-react'"
Run `npm install` to install the icons library.

### "Admin user already exists"
The admin user can only be created once. To reset:
1. Delete the user from database
2. Run `/api/init-admin` again

### "Unauthorized" when accessing `/admin`
1. Ensure you're signed in as admin user
2. Check JWT token includes `role: "ADMIN"`
3. Clear cookies and sign in again

### Redirected to `/dashboard` instead of `/admin`
This means you're not signed in with the admin account. Sign in with:
- Email: hussain-ali@univ-eloued.dz
- Password: Aida@miral1981**

## Technology Stack

- **Next.js 14** - App Router with server components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **Neon PostgreSQL** - Database
- **JWT (jose)** - Authentication tokens

## File Structure

```
app/
├── admin/
│   ├── layout.tsx              # Admin layout with sidebar
│   ├── page.tsx                # Dashboard home
│   ├── academic-years/
│   │   └── page.tsx            # Academic years management
│   ├── modules/
│   │   └── page.tsx            # Modules management
│   └── users/
│       └── page.tsx            # User management
├── api/
│   └── init-admin/
│       └── route.ts            # Admin user initialization
components/
└── AdminSidebar.tsx            # Admin navigation sidebar
lib/
├── auth.ts                     # isAdmin() helper added
└── db.ts                       # Updated with new tables
middleware.ts                   # Admin route protection
```

## License
Internal use for University of El Oued.
