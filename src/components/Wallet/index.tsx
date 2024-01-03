import { useShuttle } from '@delphi-labs/shuttle-react'
import { useEffect } from 'react'

import WalletConnectButton from 'components/Wallet/WalletConnectButton'
import WalletConnectedButton from 'components/Wallet/WalletConnectedButton'
import WalletConnecting from 'components/Wallet/WalletConnecting'
import useCurrentWallet from 'hooks/useCurrentWallet'
import useStore from 'store'

export default function Wallet() {
  const { disconnectWallet } = useShuttle()
  const currentWallet = useCurrentWallet()
  const address = useStore((s) => s.address)

  useEffect(() => {
    if (address) return
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
                accounts: null,
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
