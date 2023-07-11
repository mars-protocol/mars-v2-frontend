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

  const { status, connectedWallet } = useWalletManager()
  const { simulate, sign, broadcast } = useWallet()
  const client = useStore((s) => s.client)
  const address = useStore((s) => s.address)

  // Set connection status
  useEffect(() => {
    const isConnected = status === WalletConnectionStatus.Connected

    useStore.setState({ status })
    useStore.setState(
      isConnected
        ? {
            address: connectedWallet?.account.address,
          }
        : { address: undefined, accounts: null, client: undefined },
    )
  }, [status, connectedWallet?.account.address])

  // Set the client
  useEffect(() => {
    if (!connectedWallet || client) return
    async function getCosmWasmClient() {
      if (!connectedWallet) return

      const cosmClient = await getClient(connectedWallet.network.rpc)
      const client = {
        broadcast,
        cosmWasmClient: cosmClient,
        connectedWallet,
        sign,
        simulate,
      }
      useStore.setState({ client })
    }

    getCosmWasmClient()
  }, [connectedWallet, client, simulate, sign, broadcast])

  // Redirect when switching wallets or on first connection
  useEffect(() => {
    if (!address || address === addressInUrl) return
    navigate(getRoute(getPage(pathname), address))
  }, [address, addressInUrl, navigate, pathname])

  return address ? <ConnectedButton /> : <ConnectButton status={status} />
}
