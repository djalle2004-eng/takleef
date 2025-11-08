export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { hashPassword, createToken, isValidEmailDomain } from '@/lib/auth';
import { signUpSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = signUpSchema.parse(body);
    const { email, password } = validatedData;
    
    // Additional domain check
    if (!isValidEmailDomain(email)) {
      return NextResponse.json(
        { error: 'Only @univ-eloued.dz email addresses are allowed' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;
    
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Create user
    const result = await sql`
      INSERT INTO users (email, password_hash, role)
      VALUES (${email}, ${passwordHash}, 'PROFESSOR')
      RETURNING id, email, role, created_at
    `;
    
    const user = result[0];
    
    // Create token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    // Create response
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at,
        },
      },
      { status: 201 }
    );
    
    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
