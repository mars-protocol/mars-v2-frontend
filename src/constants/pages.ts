export const EARN_TABS: Tab[] = [
  { page: 'lend', name: 'Lend' },
  { page: 'farm', name: 'Farm' },
]

export const getEarnTabs = (chainConfig: ChainConfig): Tab[] => {
  return EARN_TABS
}

export const HLS_TABS: Tab[] = [
  { page: 'hls-staking', name: 'Staking' },
  { page: 'hls-farm', name: 'Farm' },
]

export const VAULT_DETAILS_TABS: Tab[] = [
  { page: 'vaults/{vaultId}/details', name: 'Overview' },
  { page: 'vaults/{vaultId}/details', name: 'Performance' },
]
