export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

const canRunInProduction = process.env.ALLOW_INIT_ADMIN === 'true';

export async function POST() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database connection is not configured' },
        { status: 500 }
      );
    }

    if (process.env.NODE_ENV === 'production' && !canRunInProduction) {
      return NextResponse.json(
        { error: 'Admin initialization endpoint is disabled in production.' },
        { status: 403 }
      );
    }

    const adminEmail = 'hussain-ali@univ-eloued.dz';
    const adminPassword = 'Aida@miral1981**';
    
    // Check if admin already exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${adminEmail}
    `;
    
    if (existing.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Admin user already exists' 
        },
        { status: 400 }
      );
    }
    
    // Hash password
    const passwordHash = await hashPassword(adminPassword);
    
    // Create admin user
    await sql`
      INSERT INTO users (email, password_hash, role)
      VALUES (${adminEmail}, ${passwordHash}, 'ADMIN')
    `;
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Admin user created successfully',
        email: adminEmail
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Admin initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user', details: error.message },
      { status: 500 }
    );
  }
}
