import { useCallback, useEffect, useRef } from 'react'
import { useWeb3Modal, useWeb3ModalEvents, useWeb3ModalState } from '@web3modal/wagmi/react'
import { useAccount, useDisconnect } from 'wagmi'
import useStore from 'store'

export function useWeb3WalletConnection() {
  const { open } = useWeb3Modal()
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const hasLoggedConnection = useRef(false)
  const wasInFundModal = useRef(false)
  const events = useWeb3ModalEvents()
  const modalState = useWeb3ModalState()

  const clearBalances = useCallback(() => {
    useStore.setState((state) => ({
      balances: state.balances.filter((balance) => !balance.chainName),
    }))
  }, [])

  const clearSelectedDenoms = useCallback(() => {
    useStore.setState((state) => ({
      walletAssetsModal: {
        ...state.walletAssetsModal,
        selectedDenoms:
          state.walletAssetsModal?.selectedDenoms?.filter((denom) =>
            denom.includes(':undefined'),
          ) || [],
      },
    }))
  }, [])

  const handleDisconnectWallet = useCallback(async () => {
    try {
      disconnect()
      clearBalances()
      clearSelectedDenoms()
      hasLoggedConnection.current = false
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }, [disconnect, clearBalances, clearSelectedDenoms])

  const handleConnectWallet = useCallback(async () => {
    try {
      const fundAndWithdrawModal = useStore.getState().fundAndWithdrawModal
      if (fundAndWithdrawModal) {
        useStore.setState({ fundAndWithdrawModal: null })
        wasInFundModal.current = true
      } else {
        wasInFundModal.current = false
      }
      await open()
      return true
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      return false
    }
  }, [open])

  useEffect(() => {
    hasLoggedConnection.current = isConnected
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

  return { isConnected, address, handleConnectWallet, handleDisconnectWallet }
}
