import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { resetPasswordSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = resetPasswordSchema.parse(body);
    const { token, password } = validatedData;
    
    // Find valid token
    const result = await sql`
      SELECT user_id, expires_at 
      FROM password_reset_tokens 
      WHERE token = ${token}
    `;
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }
    
    const resetToken = result[0];
    
    // Check if token is expired
    if (new Date() > new Date(resetToken.expires_at)) {
      // Delete expired token
      await sql`
        DELETE FROM password_reset_tokens WHERE token = ${token}
      `;
      
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }
    
    // Hash new password
    const passwordHash = await hashPassword(password);
    
    // Update user password
    await sql`
      UPDATE users 
      SET password_hash = ${passwordHash}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${resetToken.user_id}
    `;
    
    // Delete used token
    await sql`
      DELETE FROM password_reset_tokens WHERE token = ${token}
    `;
    
    return NextResponse.json(
      { success: true, message: 'Password has been reset successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Reset password error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'An error occurred resetting your password' },
      { status: 500 }
    );
  }
}
