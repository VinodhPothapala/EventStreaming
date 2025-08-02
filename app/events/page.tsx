// app/events/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { EventCard } from '@/components/EventCard';
import { Tier, tierHierarchy } from '@/lib/tier';
import { UserButton, useUser } from '@clerk/nextjs';

type EventRow = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  image_url: string | null;
  tier: Tier;
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [userTier, setUserTier] = useState<Tier>('free');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    fetchEvents();
  }, [isLoaded, isSignedIn]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/events');

      // If response is not OK, grab text for debugging
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Fetch failed ${res.status}: ${txt || res.statusText}`);
      }

      let json;
      try {
        json = await res.json();
      } catch (parseErr) {
        const raw = await res.text(); // second attempt to get raw body
        console.error('Raw /api/events response (failed JSON parse):', raw);
        throw new Error('Failed to parse JSON from /api/events: ' + parseErr);
      }

      setEvents(json.events);
      setUserTier(json.userTier);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };


  const handleTierChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTier = e.target.value as Tier;
    setUpgrading(true);
    try {
      const res = await fetch('/api/upgrade-tier', {
        method: 'POST',
        body: JSON.stringify({ tier: newTier }),
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update tier');
      setUserTier(json.tier);
      await fetchEvents(); // refetch after upgrade
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
              // Clerk sign-in redirect
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
            <div className="text-xs text-gray-600">Current Tier: {userTier.toUpperCase()}</div>
          </div>
        </div>
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label htmlFor="tier-select" className="text-sm">
              Simulate Tier:
            </label>
            <select
              id="tier-select"
              value={userTier}
              onChange={handleTierChange}
              disabled={upgrading}
              className="border rounded px-2 py-1"
            >
              {tierHierarchy.map((t) => (
                <option key={t} value={t}>
                  {t.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button
              onClick={fetchEvents}
              disabled={loading}
              className="px-3 py-1 bg-green-600 text-white rounded"
            >
              Refresh
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
        <div>No events available for your tier.</div>
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
              userTier={userTier}
            />
          ))}
        </div>
      )}
    </div>
  );
}
