// app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { tierOrder } from '@/lib/tier';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { getClerkClient } from '@/lib/clerkClientHelper';
import type { Database } from '@/types/database';
import type { Tier } from '@/types/database';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clerkClient = await getClerkClient();
    const user = await clerkClient.users.getUser(userId);
    const userTier = (user.publicMetadata?.tier as Tier) || 'free';

    // Sync into user_tiers (upsert)
    const upsertRes = await supabaseAdmin
      .from('user_tiers')
      .upsert(
        {
          clerk_id: userId, // string like "user_xxx"
          tier: userTier,
        },
        { onConflict: 'clerk_id' }
      )
      .select();

    if (upsertRes.error) {
      console.error('user_tiers upsert error:', upsertRes.error);
      return NextResponse.json({ error: upsertRes.error.message }, { status: 500 });
    }

    // Fetch all events
    const { data, error } = await supabaseAdmin
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });


    if (error) {
      console.error('fetch events error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter by tier: user sees their tier and any below
    const filtered = (data || []).filter(
      (e) => tierOrder(e.tier as Tier) <= tierOrder(userTier)
    );

    return NextResponse.json({ events: filtered, userTier });
  } catch (err: any) {
    console.error('Unexpected /api/events failure:', err);
    return NextResponse.json(
      { error: err?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
