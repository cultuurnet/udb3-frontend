import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getAuthEdgeServer } from '@/auth/edge';

import { defaultCookieOptions } from './hooks/useCookiesWithOptions';
import { isTokenValid } from './utils/isTokenValid';

const authEdgeServer = getAuthEdgeServer();

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const middleware = async (request: NextRequest) => {
  if (request.nextUrl.pathname === '/') {
    const token = request.cookies.get('token')?.value;
    if (isTokenValid(token)) {
      return NextResponse.redirect(new URL('/dashboard', baseUrl));
    }
  }
  if (request.nextUrl.pathname.startsWith('/login')) {
    const referer = request.cookies.get('auth0.redirect_uri')?.value;

    if (!referer) {
      return;
    }

    try {
      const response = NextResponse.redirect(referer);
      const { accessToken, idToken } = await authEdgeServer.getSession(
        request,
        response,
      );
      response.cookies.set('token', accessToken, defaultCookieOptions);
      response.cookies.set('idToken', idToken, defaultCookieOptions);
      response.cookies.set('auth0.redirect_uri', '', { maxAge: 0 });
      return response;
    } catch (err) {
      const response = NextResponse.next();
      response.cookies.set('auth0.redirect_uri', '', { maxAge: 0 });
      return response;
    }
  }

  if (request.nextUrl.pathname.startsWith('/event')) {
    const shouldHideBetaVersion =
      process.env.NEXT_PUBLIC_SHOULD_SHOW_BETA_VERSION !== 'true';

    const hasSeenConversionPage =
      request.cookies.get('has_seen_beta_conversion_page')?.value === 'true';

    if (shouldHideBetaVersion || hasSeenConversionPage) return;

    const url = new URL('/beta-version', baseUrl);
    return NextResponse.redirect(url);
  }
};

export const config = {
  matcher: ['/', '/event', '/login'],
};
