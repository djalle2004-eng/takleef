# Takleef - University Portal

A Next.js 14 authentication application built for University of El Oued with TypeScript, Tailwind CSS, and Neon PostgreSQL database.

## Features

- ✅ **User Authentication** - Secure sign-up and sign-in functionality
- ✅ **Email Domain Restriction** - Only allows @univ-eloued.dz email addresses
- ✅ **Professor Profile Management** - Mandatory profile completion after first login
- ✅ **Protected Routes** - Middleware-based route protection
- ✅ **Password Reset** - Forgot password functionality with token-based reset
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Modern UI** - Beautiful, responsive design with Tailwind CSS and Arabic support
- ✅ **TypeScript** - Full type safety throughout the application

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Neon PostgreSQL database account
- Your Neon database connection string

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Neon Database Connection
DATABASE_URL=your_neon_database_connection_string_here

# JWT Secret (generate a secure random string)
JWT_SECRET=your_secure_jwt_secret_key_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:** 
- Replace `your_neon_database_connection_string_here` with your actual Neon database connection string
- Generate a secure random string for `JWT_SECRET` (you can use `openssl rand -base64 32` in terminal)

### 3. Initialize the Database

After setting up your environment variables, initialize the database tables by visiting:

```
http://localhost:3000/api/init-db
```

This will create the necessary tables (`users` and `password_reset_tokens`).

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
takleef/
├── app/
│   ├── api/
│   │   ├── auth/          # Authentication API routes
│   │   │   ├── signup/
│   │   │   ├── signin/
│   │   │   ├── signout/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   └── me/
│   │   ├── profile/       # Profile management API routes
│   │   │   ├── status/
│   │   │   └── complete/
│   │   └── init-db/       # Database initialization
│   ├── dashboard/         # Protected dashboard page
│   ├── complete-profile/  # Profile completion form
│   ├── signin/            # Sign in page
│   ├── signup/            # Sign up page
│   ├── forgot-password/   # Forgot password page
│   ├── reset-password/    # Password reset page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   └── SignOutButton.tsx  # Sign out component
├── lib/
│   ├── auth.ts            # Authentication utilities
│   ├── db.ts              # Database configuration
│   └── validations.ts     # Zod validation schemas
├── middleware.ts          # Route protection middleware
└── package.json
```

## Authentication Flow

### Sign Up
1. User visits `/signup`
2. Enters email (must be @univ-eloued.dz domain) and password
3. System validates email domain and creates account
4. JWT token is set in HTTP-only cookie
5. User is redirected to dashboard
6. On first login, user is redirected to `/complete-profile` to fill mandatory information

### Sign In
1. User visits `/signin`
2. Enters credentials
3. System verifies credentials
4. JWT token is set in HTTP-only cookie
5. User is redirected to dashboard or original requested page

### Forgot Password
1. User visits `/forgot-password`
2. Enters email address
3. System generates a reset token (valid for 1 hour)
4. In development mode, reset URL is displayed (in production, send via email)
5. User clicks reset link
6. Enters new password on `/reset-password` page
7. Password is updated and user can sign in

### Profile Completion (First Login)
1. After successful registration/login, system checks if professor profile exists
2. If no profile exists, user is redirected to `/complete-profile`
3. User fills mandatory profile information:
   - Full Name (Arabic and Latin)
   - Academic Rank
   - Professional Email (pre-filled, read-only)
   - Personal Email (optional)
   - Primary Phone Number
   - Secondary Phone Number (optional)
   - PhD Specialization
   - Field of Research (optional)
   - Department
4. Profile is saved to database
5. User can access dashboard with full profile information

### Protected Routes
- Routes under `/dashboard` and `/complete-profile` are automatically protected
- Unauthenticated users are redirected to `/signin`
- Authenticated users without profile are redirected to `/complete-profile`
- Authenticated users attempting to access auth pages are redirected to `/dashboard`

## API Routes

### POST `/api/auth/signup`
Create a new user account

**Request Body:**
```json
{
  "email": "user@univ-eloued.dz",
  "password": "password123"
}
```

### POST `/api/auth/signin`
Sign in an existing user

**Request Body:**
```json
{
  "email": "user@univ-eloued.dz",
  "password": "password123"
}
```

### POST `/api/auth/signout`
Sign out the current user

### POST `/api/auth/forgot-password`
Request a password reset

**Request Body:**
```json
{
  "email": "user@univ-eloued.dz"
}
```

### POST `/api/auth/reset-password`
Reset password with token

**Request Body:**
```json
{
  "token": "reset_token_here",
  "password": "newpassword123"
}
```

### GET `/api/auth/me`
Get current authenticated user

### POST `/api/profile/complete`
Complete or update professor profile

**Request Body:**
```json
{
  "fullNameArabic": "الاسم الكامل",
  "fullNameLatin": "Full Name",
  "academicRank": "Professor",
  "professionalEmail": "user@univ-eloued.dz",
  "personalEmail": "personal@example.com",
  "primaryPhone": "+213 XXX XXX XXX",
  "secondaryPhone": "+213 XXX XXX XXX",
  "phdSpecialization": "Economics",
  "fieldOfResearch": "Research interests...",
  "department": "قسم العلوم الاقتصادية"
}
```

### GET `/api/profile/complete`
Get professor profile for current user

### GET `/api/profile/status`
Check if user has completed their profile

### GET `/api/init-db`
Initialize database tables (run once during setup)

## Security Features

- **Password Hashing**: Passwords are hashed using bcrypt before storage
- **JWT Tokens**: Secure token-based authentication with 7-day expiration
- **HTTP-Only Cookies**: Tokens stored in HTTP-only cookies to prevent XSS attacks
- **Email Domain Validation**: Only @univ-eloued.dz emails are allowed
- **Protected Routes**: Middleware automatically protects specified routes
- **Password Reset Tokens**: Time-limited tokens for password reset (1 hour expiration)

## Development Notes

### Password Reset in Development
In development mode, the password reset URL is returned in the API response. In production, you should:
1. Set up an email service (e.g., SendGrid, AWS SES, Resend)
2. Send the reset link via email
3. Remove the `resetUrl` and `resetToken` from the API response

### Database Schema
The application creates three tables:

1. **users** - Authentication data
   - `id`, `email`, `password_hash`, `created_at`, `updated_at`

2. **professors** - Professor profile information
   - `id`, `user_id`, `full_name_arabic`, `full_name_latin`
   - `academic_rank`, `professional_email`, `personal_email`
   - `primary_phone`, `secondary_phone`, `phd_specialization`
   - `field_of_research`, `department`, `profile_completed`
   - `created_at`, `updated_at`

3. **password_reset_tokens** - Password reset tokens
   - `id`, `user_id`, `token`, `expires_at`, `created_at`

### Database Migrations
If you need to modify the database schema:
1. Update the SQL in `lib/db.ts`
2. Either drop and recreate tables or write migration scripts

## Production Deployment

### Environment Variables for Production
Ensure you set these in your production environment:
- `DATABASE_URL` - Your production Neon database connection string
- `JWT_SECRET` - A secure, randomly generated secret
- `NEXT_PUBLIC_APP_URL` - Your production domain URL
- `NODE_ENV=production`

### Build Commands
```bash
npm run build
npm run start
```

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Neon PostgreSQL** - Serverless PostgreSQL database
- **bcryptjs** - Password hashing
- **jose** - JWT token handling
- **Zod** - Schema validation

## License

This project is created for University of El Oued.

## Support

For issues or questions, please contact the development team.
