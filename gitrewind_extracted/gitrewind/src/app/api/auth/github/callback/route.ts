// GitHub OAuth Callback
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  // Verify state
  const cookieStore = await cookies();
  const storedState = cookieStore.get('oauth_state')?.value;

  if (!state || state !== storedState) {
    return NextResponse.redirect(`${appUrl}?error=invalid_state`);
  }

  // Clear the state cookie
  cookieStore.delete('oauth_state');

  if (!code) {
    return NextResponse.redirect(`${appUrl}?error=no_code`);
  }

  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}?error=config_error`);
  }

  try {
    // Exchange code for token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenResponse.json() as { access_token?: string; error?: string };

    if (tokenData.error || !tokenData.access_token) {
      return NextResponse.redirect(`${appUrl}?error=token_error`);
    }

    const accessToken = tokenData.access_token;

    // Fetch user profile
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(`${appUrl}?error=user_fetch_error`);
    }

    const userData = await userResponse.json() as {
      login: string;
      name: string | null;
      avatar_url: string;
      bio: string | null;
    };

    // Encode user data and token in URL fragment (client-side only, not in server logs)
    const authData = {
      token: accessToken,
      user: {
        login: userData.login,
        name: userData.name,
        avatarUrl: userData.avatar_url,
        bio: userData.bio,
      },
    };

    const encodedData = Buffer.from(JSON.stringify(authData)).toString('base64');

    // Use URL fragment (#) instead of query string to prevent server-side logging
    return NextResponse.redirect(`${appUrl}/wrapped#auth=${encodedData}`);
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(`${appUrl}?error=oauth_error`);
  }
}
