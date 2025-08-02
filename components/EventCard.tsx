'use client';
import { format } from 'date-fns';
import type { Tier } from '@/types/database';
import { tierOrder } from '@/lib/tier';

type Props = {
  title: string;
  description: string;
  event_date: string;
  tier: Tier;
  image_url?: string;
  userTier: Tier;
  locked: boolean;
};

const tierColors: Record<Tier, string> = {
  free: 'bg-gray-200 text-gray-800',
  silver: 'bg-slate-200 text-slate-800',
  gold: 'bg-yellow-200 text-yellow-800',
  platinum: 'bg-purple-200 text-purple-800',
};

export function EventCard({
  title,
  description,
  event_date,
  tier,
  image_url,
  userTier,
  locked,
}: Props) {
  return (
    <div
      className={`relative border rounded-lg overflow-hidden shadow-sm bg-white flex flex-col transition ${
        locked ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
      }`}
      aria-disabled={locked}
      title={
        locked
          ? `Upgrade to ${tier.toUpperCase()} to access this event`
          : undefined
      }
    >
      <div className="h-40 w-full overflow-hidden">
        <img
          src={image_url || 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&fit=crop&w=400&h=200&q=80'}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          <span
            className={`text-xs px-2 py-1 rounded ${tierColors[tier]}`}
          >
            {tier.toUpperCase()}
          </span>
        </div>
        <p className="text-sm flex-1">{description}</p>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-xs text-gray-600">
            {format(new Date(event_date), 'PPP p')}
          </div>
          {!locked ? (
            <div className="text-sm font-medium text-green-600">Available</div>
          ) : (
            <div className="text-sm font-medium text-red-600">
              Locked
            </div>
          )}
        </div>
      </div>
      {/* Optional subtle badge for locked */}
      {locked && (
        <div className="absolute top-2 right-2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
          Upgrade
        </div>
      )}
    </div>
  );
}
