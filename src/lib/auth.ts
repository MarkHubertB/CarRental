import { Session } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * Verifies if the current user session belongs to an administrator.
 * Assumes the user has a 'role' property in their user_metadata set to 'admin'.
 */
export async function verifyAdminSession(session: Session | null) {
  if (!session) {
    return {
      isAdmin: false,
      error: NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 }),
    };
  }

  const role = session.user.user_metadata?.role;

  if (role !== 'admin') {
    return {
      isAdmin: false,
      error: NextResponse.json({ error: 'Forbidden: Administrator access required' }, { status: 403 }),
    };
  }

  return { isAdmin: true, error: null };
}
