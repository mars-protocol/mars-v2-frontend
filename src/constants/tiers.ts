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
    color: '#EEEEEE',
    benefits: ['0% Trading Fee Discount'],
  },
  {
    id: 2,
    name: 'Tier 2',
    minAmount: 10_000,
    color: '#10B981',
    benefits: ['10% Trading Fee Discount'],
  },
  {
    id: 3,
    name: 'Tier 3',
    minAmount: 50_000,
    color: '#3B82F6',
    benefits: ['20% Trading Fee Discount'],
  },
  {
    id: 4,
    name: 'Tier 4',
    minAmount: 100_000,
    color: '#a600b3',
    benefits: ['30% Trading Fee Discount'],
  },
  {
    id: 5,
    name: 'Tier 5',
    minAmount: 250_000,
    color: '#8B5CF6',
    benefits: ['45% Trading Fee Discount'],
  },
  {
    id: 6,
    name: 'Tier 6',
    minAmount: 500_000,
    color: '#F59E0B',
    benefits: ['60% Trading Fee Discount'],
  },
  {
    id: 7,
    name: 'Tier 7',
    minAmount: 1_000_000,
    color: '#ff6661',
    benefits: ['70% Trading Fee Discount'],
  },
  {
    id: 8,
    name: 'Tier 8',
    minAmount: 1_500_000,
    color: '#d31212',
    benefits: ['80% Trading Fee Discount'],
  },
]

// MARS token constants
export const MARS_DENOM = 'factory/neutron1ndu2wvkrxtane8se2tr48gv7nsm46y5gcqjhux/MARS'
export const MARS_DECIMALS = 6
