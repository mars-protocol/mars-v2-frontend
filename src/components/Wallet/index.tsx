import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { useShuttle } from '@delphi-labs/shuttle-react'
import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import WalletConnectButton from 'components/Wallet/WalletConnectButton'
import WalletConnectedButton from 'components/Wallet/WalletConnectedButton'
import useCurrentWallet from 'hooks/useCurrentWallet'
import useStore from 'store'
import { getPage, getRoute } from 'utils/route'

export default function Wallet() {
  const navigate = useNavigate()
  const { address: addressInUrl } = useParams()
  const { pathname } = useLocation()
  const currentWallet = useCurrentWallet()
  const { simulate, sign, broadcast } = useShuttle()
  const address = useStore((s) => s.address)
  const client = useStore((s) => s.client)

  // Set connection status
  useEffect(() => {
    const isConnected = !!currentWallet
    useStore.setState(
      isConnected
        ? {
            address: currentWallet.account.address,
          }
        : { address: undefined, accounts: null, client: undefined },
    )
  }, [currentWallet])

  // Set the client
  useEffect(() => {
    async function getCosmWasmClient() {
      if (client || !currentWallet) return
      const cosmClient = await CosmWasmClient.connect(currentWallet.network.rpc)
      const walletClient: WalletClient = {
        broadcast,
        cosmWasmClient: cosmClient,
        connectedWallet: currentWallet,
        sign,
        simulate,
      }
      useStore.setState({ client: walletClient })
    }

    getCosmWasmClient()
  }, [currentWallet, address, simulate, sign, broadcast, client])

  // Redirect when switching wallets or on first connection
  useEffect(() => {
    if (!address || address === addressInUrl) return
    navigate(getRoute(getPage(pathname), address))
  }, [address, addressInUrl, navigate, pathname])

  return address ? <WalletConnectedButton /> : <WalletConnectButton />
}
