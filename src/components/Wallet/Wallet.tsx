'use client'

import {
  getClient,
  useWallet,
  useWalletManager,
  WalletConnectionStatus,
} from '@marsprotocol/wallet-connector'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import ConnectButton from 'components/Wallet/ConnectButton'
import ConnectedButton from 'components/Wallet/ConnectedButton'
import useParams from 'hooks/useParams'
import useStore from 'store'

export default function Wallet() {
  const router = useRouter()
  const params = useParams()
  const { status } = useWalletManager()
  const [isConnected, setIsConnected] = useState(false)
  const { recentWallet, simulate, sign, broadcast } = useWallet()
  const client = useStore((s) => s.client)

  useEffect(() => {
    const connectedStatus = status === WalletConnectionStatus.Connected
    if (connectedStatus === isConnected) return
    setIsConnected(connectedStatus)
  }, [status, isConnected])

  useEffect(() => {
    const address = client?.recentWallet.account.address
    if (!address || address === params.wallet || address === 'accounts') return

    router.push(`/wallets/${client.recentWallet.account.address}`)
  }, [client, params, isConnected])

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
