// app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { tierOrder } from '@/lib/tier';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { getClerkClient } from '@/lib/clerkClientHelper';
import type { Tier } from '@/types/database';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clerkClient = await getClerkClient();
    const user = await clerkClient.users.getUser(userId);
    const clerkTier = (user.publicMetadata?.tier as Tier) || 'free';

    const url = new URL(req.url);
    const doSync = url.searchParams.get('sync') === 'true';
    const useClerkTier = url.searchParams.get('use_clerk') === 'true';

    let userTier: Tier;
    if (doSync) {
    // persist current Clerk tier
    const { error: upsertError } = await supabaseAdmin
        .from('user_tiers')
        .upsert(
        {
            clerk_id: userId,
            tier: clerkTier,
        },
        { onConflict: 'clerk_id' }
        );
    if (upsertError) {
        console.error('user_tiers upsert error:', upsertError);
        return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }
    userTier = clerkTier;
    } else if (useClerkTier) {
    // temporarily reflect the freshly-updated Clerk tier without persisting
    userTier = clerkTier;
    } else {
    // read persisted tier, fallback to Clerk tier if missing
    const { data: tierRow, error: tierError } = await supabaseAdmin
        .from('user_tiers')
        .select('tier')
        .eq('clerk_id', userId)
        .limit(1)
        .maybeSingle();

    if (tierError) {
        console.error('fetch user_tiers error:', tierError);
        return NextResponse.json({ error: tierError.message }, { status: 500 });
    }
    userTier = (tierRow?.tier as Tier) || clerkTier;
    }

    // Fetch all events
    const { data: eventsData, error: eventsError } = await supabaseAdmin
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (eventsError) {
      console.error('fetch events error:', eventsError);
      return NextResponse.json({ error: eventsError.message }, { status: 500 });
    }

    // Annotate locked status
    const eventsWithLock = (eventsData || []).map((e: any) => ({
      ...e,
      locked: tierOrder(e.tier as Tier) > tierOrder(userTier),
    }));

    return NextResponse.json({
      events: eventsWithLock,
      userTier,
    });
  } catch (err: any) {
    console.error('Unexpected /api/events failure:', err);
    return NextResponse.json(
      { error: err?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
