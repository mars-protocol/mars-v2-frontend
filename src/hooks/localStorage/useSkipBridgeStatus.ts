import useAccountIds from 'hooks/accounts/useAccountIds'
import useChainConfig from 'hooks/chain/useChainConfig'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import { useCallback, useEffect, useMemo, useState } from 'react'
import useStore from 'store'
import { BN } from 'utils/helpers'

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
  const { data: accountIds } = useAccountIds(address)
  const chainConfig = useChainConfig()

  const { data: walletBalances } = useWalletBalances(address)

  const checkTransactionStatus = useCallback(async () => {
    const skipBridgesString = localStorage.getItem(`${chainConfig.id}/skipBridges`)
    if (!skipBridgesString) {
      if (skipBridges && skipBridges.length !== 0) setSkipBridges([])
      if (hasCompletedBridge) setHasCompletedBridge(false)
      return
    }

    const bridges: SkipBridgeTransaction[] = JSON.parse(skipBridgesString)
    setSkipBridges(bridges)

    if (bridges.length > 0 && walletBalances) {
      try {
        const updatedBridges = await Promise.all(
          bridges.map(async (bridge) => {
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
        if (JSON.stringify(updatedBridges) !== JSON.stringify(bridges)) {
          localStorage.setItem(`${chainConfig.id}/skipBridges`, JSON.stringify(updatedBridges))
          setSkipBridges(updatedBridges)

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
  }, [chainConfig.id, walletBalances, skipBridges, hasCompletedBridge])

  useEffect(() => {
    checkTransactionStatus()
    const intervalId = setInterval(checkTransactionStatus, 5000)
    return () => clearInterval(intervalId)
  }, [checkTransactionStatus])

  const clearSkipBridges = useCallback(() => {
    localStorage.removeItem(`${chainConfig.id}/skipBridges`)
    setSkipBridges([])
    setHasCompletedBridge(false)
  }, [chainConfig.id])

  const shouldShowSkipBridgeModal = useMemo(
    () => address && skipBridges.length > 0 && accountIds && accountIds.length === 0,
    [address, skipBridges.length, accountIds],
  )

  return {
    skipBridges,
    clearSkipBridges,
    shouldShowSkipBridgeModal,
    hasCompletedBridge,
  }
}
