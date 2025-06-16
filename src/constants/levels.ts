export interface LevelConfig {
  id: number
  name: string
  minAmount: number // in MARS tokens (not micro units)
  color: string
  benefits: string[]
}

export const LEVEL_CONFIGS: LevelConfig[] = [
  {
    id: 1,
    name: 'Level 1',
    minAmount: 0,
    color: '#8B5CF6', // purple-500
    benefits: ['test', 'test'],
  },
  {
    id: 2,
    name: 'Level 2',
    minAmount: 1000,
    color: '#3B82F6', // blue-500
    benefits: ['test', 'test'],
  },
  {
    id: 3,
    name: 'Level 3',
    minAmount: 10000,
    color: '#10B981', // emerald-500
    benefits: ['test', 'test', 'test'],
  },
  {
    id: 4,
    name: 'Level 4',
    minAmount: 50000,
    color: '#F59E0B', // amber-500
    benefits: ['test', 'test', 'test'],
  },
  {
    id: 5,
    name: 'Level 5',
    minAmount: 100000,
    color: '#EF4444', // red-500
    benefits: ['test', 'test', 'test'],
  },
]

// MARS token constants
export const MARS_DENOM = 'factory/neutron1ndu2wvkrxtane8se2tr48gv7nsm46y5gcqjhux/MARS'
export const MARS_DECIMALS = 6
