import { useWallet, WalletConnectionStatus } from '@marsprotocol/wallet-connector'
import { ConnectButton, ConnectedButton } from 'components/Wallet'
import { useEffect, useState } from 'react'

const Wallet = () => {
  const { status } = useWallet()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const connectedStatus = status === WalletConnectionStatus.Connected
    if (connectedStatus !== isConnected) {
      setIsConnected(connectedStatus)
    }
  }, [status, isConnected])

  return !isConnected ? <ConnectButton status={status} /> : <ConnectedButton />
}

export default Wallet
