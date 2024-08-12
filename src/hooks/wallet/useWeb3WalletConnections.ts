import { useCallback } from 'react'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount, useDisconnect } from 'wagmi'
import useStore from 'store'

export function useWeb3WalletConnection(walletBalances: any[]) {
  const { open } = useWeb3Modal()
  const { isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const handleDisconnectWallet = useCallback(async () => {
    disconnect()
    useStore.setState({
      balances: walletBalances,
    })
  }, [disconnect, walletBalances])

  const handleConnectWallet = useCallback(async () => {
    await open()
  }, [open])

  return { isConnected, handleConnectWallet, handleDisconnectWallet }
}
