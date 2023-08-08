import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import WalletConnectButton from 'components/Wallet/WalletConnectButton'
import WalletConnectedButton from 'components/Wallet/WalletConnectedButton'
import WalletConnecting from 'components/Wallet/WalletConnecting'
import useCurrentWallet from 'hooks/useCurrentWallet'
import useStore from 'store'
import { getPage, getRoute } from 'utils/route'

export default function Wallet() {
  const navigate = useNavigate()
  const { address: addressInUrl } = useParams()
  const { pathname } = useLocation()
  const currentWallet = useCurrentWallet()
  const address = useStore((s) => s.address)
  const client = useStore((s) => s.client)

  useEffect(() => {
    if (!currentWallet) {
      useStore.setState({ address: undefined, accounts: null, client: undefined })
      return
    }

    if (client) {
      if (currentWallet.account.address !== address)
        useStore.setState({ address: currentWallet.account.address })
      return
    }
    useStore.setState({ focusComponent: { component: <WalletConnecting autoConnect /> } })
  }, [currentWallet, client, address])

  // Redirect when switching wallets or on first connection
  useEffect(() => {
    if (!address || address === addressInUrl) return
    navigate(getRoute(getPage(pathname), address))
  }, [address, addressInUrl, navigate, pathname])

  return address ? <WalletConnectedButton /> : <WalletConnectButton />
}
