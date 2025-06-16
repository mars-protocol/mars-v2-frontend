export interface TierConfig {
  id: number
  name: string
  minAmount: number // in MARS tokens (not micro units)
  color: string
  benefits: string[]
}

export const TIER_CONFIGS: TierConfig[] = [
  {
    id: 1,
    name: 'Tier 1',
    minAmount: 0,
    color: '#8B5CF6', // purple-500
    benefits: ['Basic access to Mars Protocol', 'Standard transaction fees'],
  },
  {
    id: 2,
    name: 'Tier 2',
    minAmount: 1000,
    color: '#3B82F6', // blue-500
    benefits: ['Reduced transaction fees', 'Priority customer support'],
  },
  {
    id: 3,
    name: 'Tier 3',
    minAmount: 10000,
    color: '#10B981', // emerald-500
    benefits: ['Enhanced yield farming rewards', 'Early access to new features', 'VIP support'],
  },
  {
    id: 4,
    name: 'Tier 4',
    minAmount: 50000,
    color: '#F59E0B', // amber-500
    benefits: [
      'Maximum rewards multiplier',
      'Exclusive governance voting power',
      'Beta testing access',
    ],
  },
  {
    id: 5,
    name: 'Tier 5',
    minAmount: 100000,
    color: '#EF4444', // red-500
    benefits: ['Ultimate rewards package', 'Direct line to Mars team', 'Custom feature requests'],
  },
]

// MARS token constants
export const MARS_DENOM = 'factory/neutron1ndu2wvkrxtane8se2tr48gv7nsm46y5gcqjhux/MARS'
export const MARS_DECIMALS = 6
