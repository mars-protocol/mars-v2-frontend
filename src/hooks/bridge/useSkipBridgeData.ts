import { useMemo, useState } from 'react'
import { BN } from 'utils/helpers'
import { demagnify } from 'utils/formatters'
import { StatusState } from '@skip-go/client'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'

interface UseSkipBridgeDataProps {
  accountBalanceData: AccountBalanceRow[]
  chainConfig: ChainConfig
}

export function useSkipBridgeData({ accountBalanceData, chainConfig }: UseSkipBridgeDataProps) {
  const [forceUpdateValue, forceUpdate] = useState({})
  const whitelistedAssets = useWhitelistedAssets()

  const enhancedAccountBalanceData = useMemo(() => {
    return accountBalanceData.map((row) => ({
      ...row,
      isWhitelisted: whitelistedAssets.some((asset) => asset.denom === row.denom),
    }))
  }, [accountBalanceData, whitelistedAssets])

  const sortedAccountBalanceData = useMemo(() => {
    return enhancedAccountBalanceData.sort((a, b) => {
      if (a.isWhitelisted && !b.isWhitelisted) return -1
      if (!a.isWhitelisted && b.isWhitelisted) return 1
      return 0
    })
  }, [enhancedAccountBalanceData])

  const dynamicAssets = useMemo(() => {
    let assets = sortedAccountBalanceData.map((asset) => ({
      ...asset,
      bridgeStatus: undefined,
      skipBridgeId: undefined,
    }))

    const skipBridgesString = localStorage.getItem('skipBridges')
    const currentBridges = skipBridgesString ? JSON.parse(skipBridgesString) : []

    if (currentBridges.length > 0) {
      const bridgedAssets = currentBridges.map(
        (bridge: SkipBridgeTransaction): AccountBalanceRow => ({
          skipBridgeId: bridge.id,
          bridgeStatus: bridge.status,
          type: 'bridge',
          symbol: 'USDC',
          size: demagnify(bridge.amount || 0, { decimals: 6, symbol: 'USDC' }),
          value: demagnify(bridge.amount || 0, { decimals: 6, symbol: 'USDC' }).toString(),
          denom: chainConfig.stables[0],
          amount: BN(bridge.amount || 0),
          apy: 0,
          amountChange: BN('0'),
          campaigns: [],
          isWhitelisted: true,
        }),
      )
      assets = [...bridgedAssets, ...assets]
    }

    return assets
  }, [sortedAccountBalanceData, chainConfig.stables])

  const currentBridges = useMemo(() => {
    const skipBridgesString = localStorage.getItem('skipBridges')
    return skipBridgesString ? JSON.parse(skipBridgesString) : []
  }, [])

  return {
    dynamicAssets,
    currentBridges,
    forceUpdateValue,
    forceUpdate,
  }
}
