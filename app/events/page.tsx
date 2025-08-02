'use client';
import { useEffect, useState } from 'react';
import { EventCard } from '@/components/EventCard';
import { tierHierarchy, tierOrder } from '@/lib/tier';
import type { Tier } from '@/types/database';
import { UserButton, useUser } from '@clerk/nextjs';

type EventRow = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  image_url: string | null;
  tier: Tier;
  locked: boolean;
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [userTier, setUserTier] = useState<Tier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const { isLoaded, isSignedIn, user } = useUser();

  // inside EventsPage component

  const fetchEvents = async (sync = false, useClerk = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (sync) params.set('sync', 'true');
      if (useClerk) params.set('use_clerk', 'true');
      const url = '/api/events' + (params.toString() ? `?${params.toString()}` : '');
      const res = await fetch(url);

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Fetch failed ${res.status}: ${txt || res.statusText}`);
      }

      const json = await res.json();
      setEvents(json.events);
      setUserTier(json.userTier);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    fetchEvents();
  }, [isLoaded, isSignedIn]);


  const handleTierChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
  const newTier = e.target.value as Tier;
    if (!newTier || newTier === userTier) return;
    setUpgrading(true);
    try {
      const res = await fetch('/api/upgrade-tier', {
        method: 'POST',
        body: JSON.stringify({ tier: newTier }),
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update tier');

      // reflect immediately using Clerk metadata (not yet persisted)
      await fetchEvents(false, true);
    } catch (err: any) {
      alert('Upgrade error: ' + err.message);
    } finally {
      setUpgrading(false);
    }
  };

  if (!isLoaded) return <div>Loading auth...</div>;
  if (!isSignedIn)
    return (
      <div className="text-center py-20">
        <p className="mb-4">You need to sign in to see events.</p>
        <div className="inline-block">
          <button
            onClick={() => {
              window.location.href = '/sign-in';
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Sign In / Sign Up
          </button>
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 items-start sm:items-center">
        <div className="flex items-center gap-4">
          <div>
            <UserButton />
          </div>
          <div>
            <div className="text-sm">
              Logged in as <strong>{user?.emailAddresses?.[0]?.emailAddress}</strong>
            </div>
            <div className="text-xs text-gray-600">
              Current Tier:{' '}
              <strong>{userTier ? userTier.toUpperCase() : 'Loading...'}</strong>
            </div>
          </div>
        </div>
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label htmlFor="tier-select" className="text-sm">
              Simulate Tier:
            </label>
            <select
              id="tier-select"
              value={userTier ?? ''}
              onChange={handleTierChange}
              disabled={upgrading || loading || userTier === null}
              className="border rounded px-2 py-1"
            >
              {tierHierarchy.map((t) => (
                <option key={t} value={t} disabled={t === userTier}>
                  {t.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button
              onClick={() => fetchEvents(true, false)}
              disabled={loading}
              className="px-3 py-1 bg-green-600 text-white rounded"
            >
              Update
            </button>
          </div>
        </div>
      </div>

      {/* Events grid */}
      {loading ? (
        <div>Loading events...</div>
      ) : error ? (
        <div className="text-red-600">Error: {error}</div>
      ) : events.length === 0 ? (
        <div>No events available.</div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map((e) => (
            <EventCard
              key={e.id}
              title={e.title}
              description={e.description}
              event_date={e.event_date}
              tier={e.tier}
              image_url={e.image_url || undefined}
              userTier={userTier!}
              locked={e.locked}
            />
          ))}
        </div>
      )}
    </div>
  );
}
