import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { createStorage } from 'wagmi'
import { arbitrum, base, celo, mainnet, optimism, polygon } from 'wagmi/chains'

export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID

if (!projectId) throw new Error('Project ID is not defined')

export const metadata = {
  name: 'Mars EVM connector',
  description: 'Mars EVM connector',
  url: 'https://app.marsprotocol.io/',
  icons: ['https://avatars.githubusercontent.com/u/82292512'],
}

const chains = [arbitrum, base, celo, mainnet, optimism, polygon] as const
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }),
})
