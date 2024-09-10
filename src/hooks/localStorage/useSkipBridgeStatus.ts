import { useCallback, useEffect, useState } from 'react'
import useStore from 'store'

type SkipBridgeTransaction = {
  txHash: string
  chainID: string
  explorerLink: string
  status: string
}

export function useSkipBridgeStatus() {
  const balances = useStore((s) => s.balances)
  const [skipBridge, setSkipBridge] = useState<SkipBridgeTransaction | null>(null)
  const [isPendingTransaction, setIsPendingTransaction] = useState(false)

  const checkTransactionStatus = useCallback(async () => {
    const skipBridgeString = localStorage.getItem('skipBridge')
    if (!skipBridgeString) return

    const skipBridge: SkipBridgeTransaction = JSON.parse(skipBridgeString)

    if (skipBridge && skipBridge.status === 'STATE_PENDING' && balances.length === 0) {
      setIsPendingTransaction(true)
      setSkipBridge(skipBridge)
      try {
        const response = await fetch(
          `https://api.skip.build/v2/tx/status?chain_id=${skipBridge.chainID}&tx_hash=${skipBridge.txHash}`,
        )
        const skipStatus = await response.json()

        if (skipStatus.status === 'STATE_COMPLETED') {
          const updatedSkipBridge = {
            ...skipBridge,
            status: 'STATE_COMPLETED',
          }
          localStorage.setItem('skipBridge', JSON.stringify(updatedSkipBridge))
          setIsPendingTransaction(false)
          setSkipBridge(null)
        }
      } catch (error) {
        console.error('Failed to fetch Skip status:', error)
      }
    } else {
      setIsPendingTransaction(false)
      setSkipBridge(null)
    }
  }, [balances])

  useEffect(() => {
    checkTransactionStatus()
    const intervalId = setInterval(checkTransactionStatus, 10000)
    return () => clearInterval(intervalId)
  }, [checkTransactionStatus])

  return { isPendingTransaction, skipBridge }
}
