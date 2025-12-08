import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if password protection is enabled
  const enablePasswordProtection = process.env.ENABLE_PASSWORD_PROTECTION === 'true';
  const sitePassword = process.env.SITE_PASSWORD;

  // If password protection is disabled, allow all requests
  if (!enablePasswordProtection || !sitePassword) {
    return NextResponse.next();
  }

  // Check if user is already authenticated (has cookie)
  const authCookie = request.cookies.get('site-auth');
  if (authCookie?.value === sitePassword) {
    return NextResponse.next();
  }

  // Check if this is a password submission
  const url = new URL(request.url);
  const submittedPassword = url.searchParams.get('password');

  if (submittedPassword === sitePassword) {
    // Password is correct - set cookie and redirect
    // Remove password from URL first
    url.searchParams.delete('password');
    const cleanUrl = url.toString();
    
    // Create redirect response and set cookie
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set('site-auth', sitePassword, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    return response;
  }

  // Show password prompt page
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/')) {
    // Allow API routes and Next.js internals
    return NextResponse.next();
  }

  // Return password prompt HTML
  return new NextResponse(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Required</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 400px;
      width: 90%;
    }
    h1 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.5rem;
    }
    p {
      color: #666;
      margin: 0 0 1.5rem 0;
      font-size: 0.9rem;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    input {
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }
    input:focus {
      outline: none;
      border-color: #667eea;
    }
    button {
      padding: 0.75rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover {
      background: #5568d3;
    }
    .error {
      color: #e74c3c;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔒 Password Required</h1>
    <p>This site is password protected. Please enter the password to continue.</p>
    <form method="GET" action="${url.pathname}">
      <input 
        type="password" 
        name="password" 
        placeholder="Enter password" 
        required 
        autofocus
      />
      <button type="submit">Continue</button>
      ${url.searchParams.get('error') ? '<div class="error">Incorrect password. Please try again.</div>' : ''}
    </form>
  </div>
</body>
</html>`,
    {
      status: 401,
      headers: {
        'Content-Type': 'text/html',
      },
    }
  );
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

