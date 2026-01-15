import { NextRequest, NextResponse } from 'next/server';

export const config = {
    matcher: ['/admin/:path*'],
};

export function middleware(req: NextRequest) {
    const basicAuth = req.headers.get('authorization');
    const cookieAuth = req.cookies.get('admin_session');

    // Check if we have a valid session cookie
    if (cookieAuth?.value === 'authenticated') {
        return NextResponse.next();
    }

    if (basicAuth) {
        const authValue = basicAuth.split(' ')[1];
        const [user, pwd] = atob(authValue).split(':');

        // Default password 'systek' if not set
        const validPassword = process.env.ADMIN_PASSWORD || 'systek';

        if (user === 'admin' && pwd === validPassword) {
            const response = NextResponse.next();
            // Set a session cookie that expires in 1 day
            response.cookies.set('admin_session', 'authenticated', {
                path: '/',
                maxAge: 86400,
                sameSite: 'strict',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            });
            return response;
        }
    }

    return new NextResponse('Authentication Required', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Admin Area"',
        },
    });
}
