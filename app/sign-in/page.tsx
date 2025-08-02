'use client';

import { SignIn, useUser, SignOutButton, useClerk } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignInPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    // explicit redirect back to /sign-in so user stays on this page after signing out
    await signOut({ redirectUrl: '/sign-in' });
  };

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white shadow rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold mb-2">You are already signed in</h2>
          <p className="mb-4">
            Logged in as{' '}
            <strong>
              {user?.emailAddresses?.[0]?.emailAddress ||
                // fallback if your Clerk version uses primaryEmailAddress
                // @ts-ignore
                user?.primaryEmailAddress?.emailAddress}
            </strong>
            .
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/events"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Go to Events
            </Link>
            {/* Option A: custom sign-out flow */}
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        <SignIn afterSignInUrl="/sign-in" />
      </div>
    </div>
  );
}