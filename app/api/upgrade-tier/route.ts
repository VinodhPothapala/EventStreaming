// app/api/upgrade-tier/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getClerkClient } from '@/lib/clerkClientHelper';
import type { Tier } from '@/types/database';
import { tierHierarchy } from '@/lib/tier';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const newTier = body.tier as Tier;
    if (!tierHierarchy.includes(newTier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const clerkClient = await getClerkClient();
    const existing = await clerkClient.users.getUser(userId);
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        ...(existing.publicMetadata || {}),
        tier: newTier,
      },
    });

    return NextResponse.json({ tier: newTier });
  } catch (err: any) {
    console.error('upgrade-tier error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to upgrade tier' },
      { status: 500 }
    );
  }
}
