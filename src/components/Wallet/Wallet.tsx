import {
  getClient,
  useWallet,
  useWalletManager,
  WalletConnectionStatus,
} from '@marsprotocol/wallet-connector'
import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import ConnectButton from 'components/Wallet/ConnectButton'
import ConnectedButton from 'components/Wallet/ConnectedButton'
import useStore from 'store'
import { getPage, getRoute } from 'utils/route'

export default function Wallet() {
  const navigate = useNavigate()
  const { address: addressInUrl } = useParams()
  const { pathname } = useLocation()

  const { status } = useWalletManager()
  const { recentWallet, simulate, sign, broadcast } = useWallet()
  const client = useStore((s) => s.client)
  const address = useStore((s) => s.address)

  // Set connection status
  useEffect(() => {
    const isConnected = status === WalletConnectionStatus.Connected

    useStore.setState({ status })
    useStore.setState(
      isConnected
        ? {
            address: recentWallet?.account.address,
          }
        : { address: undefined, accounts: null, client: undefined },
    )
  }, [status])

  // Set the client
  useEffect(() => {
    if (!recentWallet || client) return
    async function getCosmWasmClient() {
      if (!recentWallet) return

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
  }, [recentWallet, client, simulate, sign, broadcast])

  // Redirect when switching wallets or on first connection
  useEffect(() => {
    if (!address || address === addressInUrl) return
    navigate(getRoute(getPage(pathname), address))
  }, [address, addressInUrl, navigate])

  return address ? <ConnectedButton /> : <ConnectButton status={status} />
}
