// lib/tier.ts
import type { Tier as DBTier  } from '@/types/database';

export type Tier = DBTier; 
export const tierHierarchy: Tier[] = ['free', 'silver', 'gold', 'platinum'];

export function tierOrder(tier: Tier) {
  return tierHierarchy.indexOf(tier);
}
