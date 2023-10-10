import { useEffect } from 'react'

import WalletConnectButton from 'components/Wallet/WalletConnectButton'
import WalletConnectedButton from 'components/Wallet/WalletConnectedButton'
import WalletConnecting from 'components/Wallet/WalletConnecting'
import useCurrentWallet from 'hooks/useCurrentWallet'
import useStore from 'store'

export default function Wallet() {
  const currentWallet = useCurrentWallet()
  const address = useStore((s) => s.address)
  const focusComponent = useStore((s) => s.focusComponent)

  useEffect(() => {
    if (!currentWallet) return
    if (currentWallet.account.address === address || focusComponent) return
    useStore.setState({
      address: undefined,
      client: undefined,
      focusComponent: {
        component: <WalletConnecting autoConnect />,
      },
    })
  }, [currentWallet, address, focusComponent])

  return address ? <WalletConnectedButton /> : <WalletConnectButton />
}
