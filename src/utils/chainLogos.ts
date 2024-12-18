import { arbitrum, base, celo, mainnet, optimism, polygon, zkSync } from '@wagmi/core/chains'
import { CHAIN_NAMES } from './fetchUSDCBalance'

const CHAIN_ID_MAP: Record<string, number> = {
  Ethereum: mainnet.id,
  Arbitrum: arbitrum.id,
  Base: base.id,
  Celo: celo.id,
  Optimism: optimism.id,
  Polygon: polygon.id,
  zkSync: zkSync.id,
}

// Using CDN URLs from chainlist.org which are reliable and optimized
const CHAIN_ICONS: Record<number, string> = {
  [mainnet.id]: 'https://icons.llamao.fi/icons/chains/rsz_ethereum.jpg',
  [arbitrum.id]: 'https://icons.llamao.fi/icons/chains/rsz_arbitrum.jpg',
  [base.id]: 'https://icons.llamao.fi/icons/chains/rsz_base.jpg',
  [celo.id]: 'https://icons.llamao.fi/icons/chains/rsz_celo.jpg',
  [optimism.id]: 'https://icons.llamao.fi/icons/chains/rsz_optimism.jpg',
  [polygon.id]: 'https://icons.llamao.fi/icons/chains/rsz_polygon.jpg',
  [zkSync.id]: 'https://icons.llamao.fi/icons/chains/rsz_zksync.jpg',
}

export function getChainLogoByName(chainName: string): string {
  const chainId = CHAIN_ID_MAP[chainName]
  if (!chainId) return ''

  return CHAIN_ICONS[chainId] ?? ''
}
