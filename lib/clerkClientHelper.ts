// lib/clerkClientHelper.ts
import { clerkClient as maybeFn } from '@clerk/nextjs/server';

// Infer the actual client shape whether it's a function or object
type ClerkClientType = Awaited<
  ReturnType<
    typeof maybeFn extends (...args: any[]) => any ? typeof maybeFn : () => typeof maybeFn
  >
>;

export async function getClerkClient(): Promise<ClerkClientType> {
  if (typeof maybeFn === 'function') {
    return (await maybeFn()) as ClerkClientType;
  }
  return maybeFn as unknown as ClerkClientType;
}
