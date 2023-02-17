'use client'

import {
  getClient,
  useWallet,
  useWalletManager,
  WalletConnectionStatus,
} from '@marsprotocol/wallet-connector'
import { useEffect, useState } from 'react'

import ConnectButton from 'components/Wallet/ConnectButton'
import ConnectedButton from 'components/Wallet/ConnectedButton'
import { useWalletStore } from 'stores/useWalletStore'

export default function Wallet() {
  const { status } = useWalletManager()
  const [isConnected, setIsConnected] = useState(false)
  const { recentWallet, simulate, sign, broadcast } = useWallet()
  const client = useWalletStore((s) => s.client)

  useEffect(() => {
    const connectedStatus = status === WalletConnectionStatus.Connected
    if (connectedStatus === isConnected) return
    setIsConnected(connectedStatus)
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
  return isConnected ? <ConnectedButton /> : <ConnectButton status={status} />
}
