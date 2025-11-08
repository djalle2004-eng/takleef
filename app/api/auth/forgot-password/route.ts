export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { generateResetToken } from '@/lib/auth';
import { forgotPasswordSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = forgotPasswordSchema.parse(body);
    const { email } = validatedData;
    
    // Find user
    const result = await sql`
      SELECT id, email FROM users WHERE email = ${email}
    `;
    
    // Don't reveal if user exists or not for security
    if (result.length === 0) {
      return NextResponse.json(
        { success: true, message: 'If an account exists with this email, you will receive a password reset link.' },
        { status: 200 }
      );
    }
    
    const user = result[0];
    
    // Generate reset token
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Delete any existing tokens for this user
    await sql`
      DELETE FROM password_reset_tokens WHERE user_id = ${user.id}
    `;
    
    // Store reset token
    await sql`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (${user.id}, ${resetToken}, ${expiresAt})
    `;
    
    // In a real application, you would send an email here
    // For now, we'll return the token in the response (ONLY FOR DEVELOPMENT)
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    console.log('Password reset link:', resetUrl);
    console.log('Reset token:', resetToken);
    
    return NextResponse.json(
      {
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.',
        // Remove this in production - only for development
        resetUrl,
        resetToken,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Forgot password error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}
