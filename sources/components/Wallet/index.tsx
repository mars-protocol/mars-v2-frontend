import { useShuttle } from '@delphi-labs/shuttle-react'
import { useEffect } from 'react'

import useCurrentWallet from '../../hooks/wallet/useCurrentWallet'
import useStore from '../../store'
import WalletConnectButton from './WalletConnectButton'
import WalletConnectedButton from './WalletConnectedButton'
import WalletConnecting from './WalletConnecting'

export default function Wallet() {
  const { disconnectWallet } = useShuttle()
  const currentWallet = useCurrentWallet()
  const address = useStore((s) => s.address)

  useEffect(() => {
    if (address && currentWallet?.account.address === address) return
    useStore.setState({
      address: undefined,
      userDomain: undefined,
      client: undefined,
      focusComponent: currentWallet
        ? {
            component: <WalletConnecting />,
            onClose: () => {
              disconnectWallet(currentWallet)
              useStore.setState({
                client: undefined,
                address: undefined,
                userDomain: undefined,
                balances: [],
                focusComponent: null,
              })
            },
          }
        : null,
    })
  }, [currentWallet, address, disconnectWallet])

  return address ? <WalletConnectedButton /> : <WalletConnectButton />
}
