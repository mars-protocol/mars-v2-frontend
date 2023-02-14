'use client'

import { useWallet, WalletConnectionStatus } from '@marsprotocol/wallet-connector'
import { useEffect, useState } from 'react'
import { ConnectButton } from './ConnectButton'
import { ConnectedButton } from './ConnectedButton'

export const Wallet = () => {
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
