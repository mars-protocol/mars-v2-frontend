import React, { ReactNode, useEffect, useState } from 'react'
import { config, metadata, projectId } from 'config/ethereumConfig'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { State, WagmiProvider } from 'wagmi'

const queryClient = new QueryClient()

if (!projectId) throw new Error('Project ID is not defined')

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  metadata,
  enableAnalytics: true,
})

export default function AppKitProvider({
  children,
  initialState,
}: {
  children: ReactNode
  initialState?: State
}) {
  const [state, setState] = useState<State | undefined>(initialState)

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!state) {
      const storedState = localStorage.getItem('wagmi.state')
      if (!storedState) return

      setState(JSON.parse(storedState))
    } else {
      localStorage.setItem('wagmi.state', JSON.stringify(state))
    }
  }, [state])

  return (
    <WagmiProvider config={config} initialState={state}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
