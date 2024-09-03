export const EARN_TABS: Tab[] = [
  { page: 'lend', name: 'Lend' },
  { page: 'farm', name: 'Farm' },
]

export const getEarnTabs = (chainConfig: ChainConfig): Tab[] => {
  if (chainConfig.perps) {
    return [...EARN_TABS, { page: 'perps-vault', name: 'Perps Vault' }]
  }
  return EARN_TABS
}

export const HLS_TABS: Tab[] = [
  { page: 'hls-staking', name: 'Staking' },
  { page: 'hls-farm', name: 'Farm' },
]

export const VAUTLS_TABS: Tab[] = [
  { page: 'vaults-official', name: 'Official Vaults' },
  { page: 'vaults-community', name: 'Community Vaults' },
]
