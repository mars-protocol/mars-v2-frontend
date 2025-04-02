import { arbitrum, base, celo, mainnet, optimism, polygon } from '@wagmi/core/chains'

const CHAIN_ID_MAP: Record<string, number> = {
  Ethereum: mainnet.id,
  Arbitrum: arbitrum.id,
  Base: base.id,
  Celo: celo.id,
  Optimism: optimism.id,
  Polygon: polygon.id,
}

const CHAIN_ICONS: Record<number, string> = {
  [mainnet.id]: '/images/chainLogos/ethereum.png',
  [arbitrum.id]: '/images/chainLogos/arbitrum.png',
  [base.id]: '/images/chainLogos/base.png',
  [celo.id]: '/images/chainLogos/celo.png',
  [optimism.id]: '/images/chainLogos/optimism.png',
  [polygon.id]: '/images/chainLogos/polygon.png',
}

export function getChainLogoByName(chainName: string): string | null {
  const chainId = CHAIN_ID_MAP[chainName]
  if (!chainId) return ''

  return CHAIN_ICONS[chainId] ?? ''
}
