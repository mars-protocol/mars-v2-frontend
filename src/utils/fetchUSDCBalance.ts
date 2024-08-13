import { getBalance } from '@wagmi/core'
import { config } from 'config/ethereumConfig'
import { arbitrum, base, celo, optimism, polygon, zkSync } from '@wagmi/core/chains'

const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  // [mainnet.id]: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // Ethereum USDC
  [arbitrum.id]: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum USDC
  [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
  [celo.id]: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C', // Celo USDC
  [optimism.id]: '0x0b2c639c533813f4aa9d7837caf62653d097ff85', // OP Mainnet USDC
  [polygon.id]: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // Polygon USDC
  [zkSync.id]: '0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4', // zkSync USDC
}

const CHAIN_IDS = [
  // mainnet.id,
  base.id,
  arbitrum.id,
  celo.id,
  optimism.id,
  polygon.id,
  zkSync.id,
]

export const CHAIN_NAMES: Record<number, string> = {
  // [mainnet.id]: 'Ethereum',
  [arbitrum.id]: 'Arbitrum',
  [base.id]: 'Base',
  [celo.id]: 'Celo',
  [optimism.id]: 'Optimism',
  [polygon.id]: 'Polygon',
  [zkSync.id]: 'zkSync',
}

export async function fetchUSDCBalances(address: `0x${string}`) {
  const balances: Record<number, string> = {}

  for (const chainId of CHAIN_IDS) {
    const tokenAddress = USDC_ADDRESSES[chainId]

    try {
      const balanceData = await getBalance(config, {
        address,
        token: tokenAddress,
        chainId,
      })
      balances[chainId] = balanceData.formatted
    } catch (error) {
      balances[chainId] = 'Error fetching balance'
    }
  }
  return balances
}
