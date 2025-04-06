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

export const VAULTS_TABS: Tab[] = [
  { page: 'vaults', name: 'Official Vaults' },
  { page: 'vaults-community', name: 'Community Vaults' },
]

export const VAULT_DETAILS_TABS: Tab[] = [
  { page: 'vaults/{vaultId}/details', name: 'Overview' },
  { page: 'vaults/{vaultId}/details', name: 'Performance' },
]
