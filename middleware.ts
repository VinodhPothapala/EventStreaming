import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files, unless found in search params
//     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//     // Always run for API routes
//     '/(api|trpc)(.*)',
//   ],
    matcher: [
        // apply to everything except static assets and the auth pages themselves
        '/((?!_next/static|_next/image|favicon.ico|sign-in(?:/.*)?|sign-up(?:/.*)?).*)',
    ],
};