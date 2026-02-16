import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getStytchClient } from '@/lib/stytch/server';

const COOKIE_NAME = 'stytch_session_token';
const ADMIN_ROLE = process.env.STYTCH_ADMIN_ROLE || 'quiz_admin';

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Extracts roles from a Stytch session JWT payload.
 * The JWT has already been validated by sessions.authenticate() — we're just
 * reading the claims. Stytch puts roles inside the custom claim
 * "https://stytch.com/session" rather than populating session.roles on the
 * REST response.
 */
function getRolesFromJwt(jwt: string): string[] {
  try {
    const payload = JSON.parse(
      Buffer.from(jwt.split('.')[1], 'base64url').toString()
    );
    return payload['https://stytch.com/session']?.roles || [];
  } catch {
    return [];
  }
}

/**
 * Validates the admin session token and checks for the admin role.
 * Returns the authenticated session on success, throws AuthError on failure.
 */
async function validateAdminSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(COOKIE_NAME)?.value;

  if (!sessionToken) {
    throw new AuthError('No session token', 401);
  }

  const stytch = getStytchClient();

  try {
    const response = await stytch.sessions.authenticate({
      session_token: sessionToken,
      session_duration_minutes: 60 * 24,
    });

    // session.roles is empty in the REST response; roles live in the JWT.
    const roles = getRolesFromJwt(response.session_jwt);

    if (!roles.includes(ADMIN_ROLE)) {
      throw new AuthError('Insufficient permissions', 403);
    }

    return response;
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError('Invalid or expired session', 401);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteHandler = (...args: any[]) => Promise<NextResponse | Response>;

/**
 * Wraps an API route handler with admin authentication.
 * Validates the Stytch session token cookie and checks for the admin role.
 */
export function withAdminAuth<T extends RouteHandler>(handler: T): T {
  const wrapped = async (...args: Parameters<T>) => {
    try {
      await validateAdminSession();
      return handler(...args);
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        );
      }
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
  return wrapped as T;
}
