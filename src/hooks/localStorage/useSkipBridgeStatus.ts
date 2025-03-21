import { useCallback, useEffect, useState } from 'react'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import { BN } from 'utils/helpers'
import useStore from 'store'

type SkipBridgeTransaction = {
  asset: string
  amount: BigNumber
  denom: string
  txHash: string
  chainID: string
  explorerLink: string
  status: string
  id: string
}

type Coin = {
  denom: string
  amount: string
  chainName?: string
}

export function useSkipBridgeStatus() {
  const [skipBridges, setSkipBridges] = useState<SkipBridgeTransaction[]>([])
  const [hasCompletedBridge, setHasCompletedBridge] = useState(false)
  const address = useStore((s) => s.address)
  const { data: walletBalances } = useWalletBalances(address)

  const checkTransactionStatus = useCallback(async () => {
    const skipBridgesString = localStorage.getItem('skipBridges')
    if (!skipBridgesString) {
      setSkipBridges([])
      setHasCompletedBridge(false)
      return
    }

    const bridges: SkipBridgeTransaction[] = JSON.parse(skipBridgesString)
    setSkipBridges(bridges)

    // Always check balances if we have bridges and wallet balances
    if (bridges.length > 0 && walletBalances) {
      try {
        const updatedBridges = await Promise.all(
          bridges.map(async (bridge) => {
            // Check if the wallet has the expected balance from the bridge
            const walletBalance = (walletBalances as Coin[]).find(
              (coin) => coin.denom === bridge.denom,
            )?.amount
            if (walletBalance && BN(walletBalance).isGreaterThanOrEqualTo(bridge.amount)) {
              return {
                ...bridge,
                status: 'STATE_COMPLETED',
              }
            }
            return bridge
          }),
        )

        // Update bridges if any have been completed
        if (JSON.stringify(updatedBridges) !== JSON.stringify(bridges)) {
          localStorage.setItem('skipBridges', JSON.stringify(updatedBridges))
          setSkipBridges(updatedBridges)

          // Check if we have any completed bridges with enough USDC
          const completedBridges = updatedBridges.filter(
            (bridge) => bridge.status === 'STATE_COMPLETED',
          )
          const totalBridgedAmount = completedBridges.reduce(
            (acc, bridge) => acc.plus(bridge.amount),
            BN(0),
          )
          setHasCompletedBridge(totalBridgedAmount.isGreaterThan(0))
        }
      } catch (error) {
        console.error('Failed to check wallet balances:', error)
      }
    }
  }, [walletBalances])

  useEffect(() => {
    checkTransactionStatus()
    const intervalId = setInterval(checkTransactionStatus, 5000) // Check every 5 seconds
    return () => clearInterval(intervalId)
  }, [checkTransactionStatus])

  const clearSkipBridges = useCallback(() => {
    localStorage.removeItem('skipBridges')
    setSkipBridges([])
    setHasCompletedBridge(false)
  }, [])

  // Show modal if there are any bridges in localStorage
  const shouldShowSkipBridgeModal = skipBridges.length > 0

  return {
    skipBridges,
    clearSkipBridges,
    shouldShowSkipBridgeModal,
    hasCompletedBridge,
  }
}
