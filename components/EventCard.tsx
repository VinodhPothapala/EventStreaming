// components/EventCard.tsx
'use client';
import { Tier, tierOrder } from '@/lib/tier';
import { format } from 'date-fns';

type Props = {
  title: string;
  description: string;
  event_date: string;
  tier: Tier;
  image_url?: string;
  userTier: Tier;
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
}: Props) {
  const userOrder = tierOrder(userTier);
  const eventOrder = tierOrder(tier);
  const locked = eventOrder > userOrder;
  return (
    <div className="relative border rounded-lg overflow-hidden shadow-sm bg-white flex flex-col">
      <div className="h-40 w-full overflow-hidden">
        <img
          src={image_url || 'https://via.placeholder.com/400x200?text=Event'}
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
          {locked ? (
            <div className="text-sm font-medium text-red-600">
              Upgrade to {tier.toUpperCase()} to access
            </div>
          ) : (
            <div className="text-sm font-medium text-green-600">Available</div>
          )}
        </div>
      </div>
      {locked && (
        <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-2 font-semibold">
              {tier.toUpperCase()} content
            </div>
            <div className="text-sm">Upgrade your tier to unlock.</div>
          </div>
        </div>
      )}
    </div>
  );
}
