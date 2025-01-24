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
  id: string
}

export function useSkipBridgeStatus() {
  const [isPendingTransaction, setIsPendingTransaction] = useState(false)
  const [skipBridges, setSkipBridges] = useState<SkipBridgeTransaction[]>([])
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
    const skipBridgesString = localStorage.getItem('skipBridges')
    if (!skipBridgesString) {
      setIsPendingTransaction(false)
      setSkipBridges([])
      setShouldShowSkipBridgeModal(false)
      return
    }

    const bridges: SkipBridgeTransaction[] = JSON.parse(skipBridgesString)
    const hasPendingTransactions = bridges.some((bridge) => bridge.status === 'STATE_PENDING')

    setIsPendingTransaction(hasPendingTransactions)
    setSkipBridges(bridges)
    setShouldShowSkipBridgeModal(hasNoBalances && hasPendingTransactions)

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
                setShouldShowSkipBridgeModal(hasNoBalances && stillHasPending)
              }
            }),
        )
      } catch (error) {
        console.error('Failed to fetch Skip status:', error)
      }
    }
  }, [hasNoBalances])

  useEffect(() => {
    checkTransactionStatus()
    const intervalId = setInterval(checkTransactionStatus, 10000)
    return () => clearInterval(intervalId)
  }, [checkTransactionStatus])

  const clearSkipBridges = useCallback(() => {
    localStorage.removeItem('skipBridges')
    setSkipBridges([])
    setIsPendingTransaction(false)
    setShouldShowSkipBridgeModal(false)
  }, [])

  return {
    isPendingTransaction,
    skipBridges,
    shouldShowSkipBridgeModal,
    clearSkipBridges,
  }
}
