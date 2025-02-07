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
  [mainnet.id]: '/images/chainLogos/rsz_ethereum.jpg',
  [arbitrum.id]: '/images/chainLogos/rsz_arbitrum.jpg',
  [base.id]: '/images/chainLogos/rsz_base.jpg',
  [celo.id]: '/images/chainLogos/rsz_celo.jpg',
  [optimism.id]: '/images/chainLogos/rsz_optimism.jpg',
  [polygon.id]: '/images/chainLogos/rsz_polygon.jpg',
}

export function getChainLogoByName(chainName: string): string | null {
  const chainId = CHAIN_ID_MAP[chainName]
  if (!chainId) return ''

  return CHAIN_ICONS[chainId] ?? ''
}
