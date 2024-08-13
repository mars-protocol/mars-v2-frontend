import { useCallback, useEffect, useRef } from 'react'
import { useWeb3Modal, useWeb3ModalEvents, useWeb3ModalState } from '@web3modal/wagmi/react'
import { useAccount, useDisconnect } from 'wagmi'
import useStore from 'store'

export function useWeb3WalletConnection() {
  const { open } = useWeb3Modal()
  const { isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const hasLoggedConnection = useRef(false)
  const wasInFundModal = useRef(false)
  const events = useWeb3ModalEvents()
  const modalState = useWeb3ModalState()

  const handleDisconnectWallet = useCallback(async () => {
    disconnect()
    useStore.setState((state) => ({
      balances: state.balances.filter((balance) => !balance.chainName),
    }))
    hasLoggedConnection.current = false
  }, [disconnect])

  const handleConnectWallet = useCallback(async () => {
    const fundAndWithdrawModal = useStore.getState().fundAndWithdrawModal
    if (fundAndWithdrawModal) {
      useStore.setState({ fundAndWithdrawModal: null })
      wasInFundModal.current = true
    } else {
      wasInFundModal.current = false
    }
    await open()
  }, [open])

  useEffect(() => {
    if (isConnected) {
      console.log('Web3 wallet connection established successfully')
      hasLoggedConnection.current = true
    } else {
      hasLoggedConnection.current = false
    }
  }, [isConnected])

  useEffect(() => {
    if (events.data.event === 'CONNECT_SUCCESS' && wasInFundModal.current) {
      useStore.setState({ fundAndWithdrawModal: 'fund' })
      wasInFundModal.current = false
    }
  }, [events.data])

  useEffect(() => {
    if (modalState.open === false && wasInFundModal.current) {
      useStore.setState({ fundAndWithdrawModal: 'fund' })
      wasInFundModal.current = false
    }
  }, [modalState.open])

  return { isConnected, handleConnectWallet, handleDisconnectWallet }
}
