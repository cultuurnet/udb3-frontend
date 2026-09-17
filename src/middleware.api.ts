import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getAuthEdgeServer } from '@/auth/edge';

import { DEFAULT_COOKIE_OPTIONS } from './constants/Cookies';
import { isTokenValid } from './utils/isTokenValid';
import { isSameOriginUrl } from './utils/url';

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

    const redirectUrl = isSameOriginUrl(referer, baseUrl)
      ? referer
      : new URL('/dashboard', baseUrl);

    try {
      const response = NextResponse.redirect(redirectUrl);
      const { accessToken, idToken } = await authEdgeServer.getSession(
        request,
        response,
      );
      response.cookies.set('token', accessToken, DEFAULT_COOKIE_OPTIONS);
      response.cookies.set('idToken', idToken, DEFAULT_COOKIE_OPTIONS);
      response.cookies.set('auth0.redirect_uri', '', { maxAge: 0 });
      return response;
    } catch (err) {
      const response = NextResponse.next();
      response.cookies.set('auth0.redirect_uri', '', { maxAge: 0 });
      return response;
    }
  }
};

export const config = {
  matcher: ['/', '/event', '/login'],
};
