// GitHub OAuth Initiation
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  if (!clientId) {
    return NextResponse.json(
      { error: 'GitHub OAuth not configured' },
      { status: 500 }
    );
  }

  // Generate state for CSRF protection
  const state = crypto.randomUUID();

  // Store state in cookie
  const cookieStore = await cookies();
  cookieStore.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });

  // Build GitHub OAuth URL
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${appUrl}/api/auth/github/callback`,
    scope: 'read:user',
    state,
  });

  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}
