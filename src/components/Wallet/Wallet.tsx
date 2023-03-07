'use client'

import {
  getClient,
  useWallet,
  useWalletManager,
  WalletConnectionStatus,
} from '@marsprotocol/wallet-connector'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import ConnectButton from 'components/Wallet/ConnectButton'
import ConnectedButton from 'components/Wallet/ConnectedButton'
import useParams from 'hooks/useParams'
import useStore from 'store'
import { getCreditAccounts } from 'utils/api'

export default function Wallet() {
  const router = useRouter()
  const params = useParams()

  const { status } = useWalletManager()
  const { recentWallet, simulate, sign, broadcast } = useWallet()
  const client = useStore((s) => s.client)
  const address = useStore((s) => s.address)

  useEffect(() => {
    const isConnected = status === WalletConnectionStatus.Connected

    useStore.setState({ status })
    useStore.setState(
      isConnected
        ? {
            address: recentWallet?.account.address,
          }
        : { address: undefined, creditAccounts: null, client: undefined },
    )

    if (!isConnected || !recentWallet) return

    const fetchCreditAccounts = async () => {
      if (!recentWallet?.account.address) return
      const walletCreditAccounts = await getCreditAccounts(recentWallet?.account.address)
      useStore.setState({ creditAccounts: walletCreditAccounts })
    }

    fetchCreditAccounts()

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
    }

    if (!address || address === params.wallet) return
    router.push(`/wallets/${address}`)
  }, [broadcast, params, recentWallet, simulate, sign, status])

  return address ? <ConnectedButton /> : <ConnectButton status={status} />
}
