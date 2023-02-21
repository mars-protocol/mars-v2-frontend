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
import useStore from 'store'
import { useRouter } from 'next/navigation'

export default function Wallet() {
  const router = useRouter()
  const { status } = useWalletManager()
  const [isConnected, setIsConnected] = useState(false)
  const { recentWallet, simulate, sign, broadcast } = useWallet()
  const client = useStore((s) => s.client)

  useEffect(() => {
    const connectedStatus = status === WalletConnectionStatus.Connected
    if (connectedStatus === isConnected) return
    setIsConnected(connectedStatus)
    router.push(`/wallet/${'osmo1hn5gxjz9y02m7h7ngpayfx9rs67jxgm0a5dj5e'}`)
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
        useStore.setState({ client })
      }

      getCosmWasmClient()

      return
    }
  }, [simulate, sign, recentWallet, broadcast])
  return isConnected ? <ConnectedButton /> : <ConnectButton status={status} />
}
