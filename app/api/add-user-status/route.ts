import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST() {
  try {
    // Add is_active column to users table
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE
    `;

    // Set all existing users to active
    await sql`
      UPDATE users 
      SET is_active = TRUE 
      WHERE is_active IS NULL
    `;

    return NextResponse.json(
      { 
        success: true, 
        message: 'User status field added successfully'
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Add user status error:', error);
    return NextResponse.json(
      { error: 'Failed to add user status field', details: error.message },
      { status: 500 }
    );
  }
}
