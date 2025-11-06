import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if professor profile exists
    const result = await sql`
      SELECT id, profile_completed FROM professors WHERE user_id = ${user.userId}
    `;
    
    const hasProfile = result.length > 0;
    const isComplete = hasProfile ? result[0].profile_completed : false;
    
    return NextResponse.json(
      { 
        hasProfile,
        isComplete,
        needsCompletion: !hasProfile
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile status check error:', error);
    
    return NextResponse.json(
      { error: 'An error occurred checking profile status' },
      { status: 500 }
    );
  }
}
