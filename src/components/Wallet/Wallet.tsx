'use client'

import {
  getClient,
  useWallet,
  useWalletManager,
  WalletConnectionStatus,
} from '@marsprotocol/wallet-connector'
import { useEffect, useState } from 'react'

import { useWalletStore } from 'stores/useWalletStore'

import { ConnectButton } from './ConnectButton'
import { ConnectedButton } from './ConnectedButton'

export const Wallet = () => {
  const { status } = useWalletManager()
  const [isConnected, setIsConnected] = useState(false)
  const { recentWallet, simulate, sign, broadcast } = useWallet()
  const client = useWalletStore((s) => s.client)

  useEffect(() => {
    const connectedStatus = status === WalletConnectionStatus.Connected
    if (connectedStatus !== isConnected) {
      setIsConnected(connectedStatus)
    }
  }, [status, isConnected])

  useEffect(() => {
    if (!recentWallet) return
    if (!client) {
      const getCosmWasmClient = async () => {
        const cosmClient = await getClient(recentWallet.network.rpc)

        const client = {
          broadcast,
          cosmWasmClient: cosmClient,
          recentWallet,
          sign,
          simulate,
        }
        useWalletStore.setState({ client })
      }

      getCosmWasmClient()

      return
    }
  }, [simulate, sign, recentWallet, broadcast])

  return !isConnected ? <ConnectButton status={status} /> : <ConnectedButton />
}
