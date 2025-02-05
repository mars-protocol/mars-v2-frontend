import { arbitrum, base, celo, mainnet, optimism, polygon } from '@wagmi/core/chains'
import { Arbitrum, Base, Celo, Ethereum, Optimism, Polygon } from 'components/common/ChainLogos'
import { StaticImageData } from 'next/image'

const CHAIN_ID_MAP: Record<string, number> = {
  Ethereum: mainnet.id,
  Arbitrum: arbitrum.id,
  Base: base.id,
  Celo: celo.id,
  Optimism: optimism.id,
  Polygon: polygon.id,
}

// Using CDN URLs from chainlist.org which are reliable and optimized
const CHAIN_ICONS: Record<number, StaticImageData> = {
  [mainnet.id]: Ethereum,
  [arbitrum.id]: Arbitrum,
  [base.id]: Base,
  [celo.id]: Celo,
  [optimism.id]: Optimism,
  [polygon.id]: Polygon,
}

export function getChainLogoByName(chainName: string): StaticImageData | null {
  const chainId = CHAIN_ID_MAP[chainName]
  if (!chainId) return null

  return CHAIN_ICONS[chainId] ?? null
}
