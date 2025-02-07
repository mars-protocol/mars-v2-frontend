import { useCallback, useEffect, useState } from 'react'

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

export function useSkipBridgeStatus() {
  const [isPendingTransaction, setIsPendingTransaction] = useState(false)
  const [skipBridges, setSkipBridges] = useState<SkipBridgeTransaction[]>([])

  const checkTransactionStatus = useCallback(async () => {
    const skipBridgesString = localStorage.getItem('skipBridges')
    if (!skipBridgesString) {
      setIsPendingTransaction(false)
      setSkipBridges([])
      return
    }

    const bridges: SkipBridgeTransaction[] = JSON.parse(skipBridgesString)
    const hasPendingTransactions = bridges.some((bridge) => bridge.status === 'STATE_PENDING')

    setIsPendingTransaction(hasPendingTransactions)
    setSkipBridges(bridges)

    if (hasPendingTransactions) {
      try {
        await Promise.all(
          bridges
            .filter((bridge) => bridge.status === 'STATE_PENDING')
            .map(async (bridge) => {
              const response = await fetch(
                `https://api.skip.build/v2/tx/status?chain_id=${bridge.chainID}&tx_hash=${bridge.txHash}`,
              )
              const skipStatus = await response.json()

              if (skipStatus.status === 'STATE_COMPLETED') {
                const updatedBridges = bridges.map((b) =>
                  b.id === bridge.id ? { ...b, status: 'STATE_COMPLETED' } : b,
                )
                localStorage.setItem('skipBridges', JSON.stringify(updatedBridges))
                setSkipBridges(updatedBridges)

                const stillHasPending = updatedBridges.some((b) => b.status === 'STATE_PENDING')
                setIsPendingTransaction(stillHasPending)
              }
            }),
        )
      } catch (error) {
        console.error('Failed to fetch Skip status:', error)
      }
    }
  }, [])

  useEffect(() => {
    checkTransactionStatus()
    const intervalId = setInterval(checkTransactionStatus, 10000)
    return () => clearInterval(intervalId)
  }, [checkTransactionStatus])

  const clearSkipBridges = useCallback(() => {
    localStorage.removeItem('skipBridges')
    setSkipBridges([])
    setIsPendingTransaction(false)
  }, [])

  return {
    isPendingTransaction,
    skipBridges,
    clearSkipBridges,
  }
}
