import useAccount from 'hooks/accounts/useAccount'
import { useCallback, useEffect, useState } from 'react'
import useStore from 'store'
import useAccountIds from 'hooks/accounts/useAccountIds'
import { useParams } from 'react-router-dom'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'

type SkipBridgeTransaction = {
  asset: string
  amount: BigNumber
  denom: string
  txHash: string
  chainID: string
  explorerLink: string
  status: string
}

export function useSkipBridgeStatus() {
  const [isPendingTransaction, setIsPendingTransaction] = useState(false)
  const [skipBridge, setSkipBridge] = useState<SkipBridgeTransaction | null>(null)
  const [shouldShowSkipBridgeModal, setShouldShowSkipBridgeModal] = useState(false)

  // const { urlAddress, accountId } = useParams()
  // const address = useStore((s) => s.address)
  // const { data: accountIds } = useAccountIds(address)
  // const isUsersAccount = accountId && accountIds ? accountIds.includes(accountId) : false
  const account = useCurrentAccount()
  const hasNoBalances =
    account?.deposits.length === 0 &&
    account?.debts.length === 0 &&
    account?.lends.length === 0 &&
    account?.stakedAstroLps.length === 0 &&
    account?.vaults.length === 0
  console.log('account', account)

  const checkTransactionStatus = useCallback(async () => {
    const skipBridgeString = localStorage.getItem('skipBridge')
    if (!skipBridgeString) {
      setIsPendingTransaction(false)
      setSkipBridge(null)
      setShouldShowSkipBridgeModal(false)
      return
    }

    const skipBridge: SkipBridgeTransaction = JSON.parse(skipBridgeString)

    if (skipBridge.status === 'STATE_PENDING') {
      setIsPendingTransaction(true)
      setSkipBridge(skipBridge)
      setShouldShowSkipBridgeModal(hasNoBalances)
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
          setSkipBridge(updatedSkipBridge)
          setShouldShowSkipBridgeModal(false)
        }
      } catch (error) {
        console.error('Failed to fetch Skip status:', error)
      }
    } else {
      setIsPendingTransaction(false)
      setSkipBridge(skipBridge)
      setShouldShowSkipBridgeModal(false)
    }
  }, [hasNoBalances])

  useEffect(() => {
    checkTransactionStatus()
    const intervalId = setInterval(checkTransactionStatus, 10000)
    return () => clearInterval(intervalId)
  }, [checkTransactionStatus])

  const clearSkipBridge = useCallback(() => {
    localStorage.removeItem('skipBridge')
    setSkipBridge(null)
    setIsPendingTransaction(false)
    setShouldShowSkipBridgeModal(false)
  }, [])

  return { isPendingTransaction, skipBridge, shouldShowSkipBridgeModal, clearSkipBridge }
}
