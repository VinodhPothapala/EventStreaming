// app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata = {
  title: 'Tiered Event Showcase',
  description: 'Events filtered based on user tier',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_FRONTEND_API!}
          localization={{}}
        >
          <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
              <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
                <h1 className="text-xl font-semibold">Tiered Events</h1>
                <div>{/* Clerk sign-in / user button will appear via <UserButton /> in pages */}</div>
              </div>
            </header>
            <main className="py-8 px-4 max-w-7xl mx-auto">{children}</main>
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
