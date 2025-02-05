import { RouteResponse } from '@skip-go/client'
import { useCallback, useEffect, useState } from 'react'
import { BridgeInfo, useSkipBridge } from 'hooks/bridge/useSkipBridge'
import { WrappedBNCoin } from 'types/classes/WrappedBNCoin'
import { chainNameToUSDCAttributes } from 'utils/fetchUSDCBalance'
import { MINIMUM_USDC } from 'utils/constants'
import { BN_ZERO } from 'constants/math'

interface UseBridgeRouteProps {
  chainConfig: any
  cosmosAddress?: string
  evmAddress?: string
  fundingAssets: WrappedBNCoin[]
}

export function useBridgeRoute({
  chainConfig,
  cosmosAddress,
  evmAddress,
  fundingAssets,
}: UseBridgeRouteProps) {
  const [goFast, setGoFast] = useState(true)
  const [currentRoute, setCurrentRoute] = useState<RouteResponse | undefined>(undefined)
  const [routeError, setRouteError] = useState<string | null>(null)
  const [bridges, setBridges] = useState<BridgeInfo[]>([])
  const [isLoadingRoute, setIsLoadingRoute] = useState(false)
  const [currentEVMAssetValue, setCurrentEVMAssetValue] = useState<BigNumber>(BN_ZERO)
  const [previousEVMAmount, setPreviousEVMAmount] = useState<BigNumber>(BN_ZERO)
  const [showMinimumUSDCValueOverlay, setShowMinimumUSDCValueOverlay] = useState(false)

  const { isBridgeInProgress, handleSkipTransfer, fetchSkipRoute, fetchBridgeLogos } =
    useSkipBridge({
      chainConfig,
      cosmosAddress,
      evmAddress,
      goFast,
    })

  const evmAsset = fundingAssets.find(
    (asset) => asset.chain && chainNameToUSDCAttributes[asset.chain],
  )

  const isEVMAssetLessThanMinimumUSDC = evmAsset?.coin.amount.isLessThan(MINIMUM_USDC)

  const updateEVMAssetValue = useCallback(() => {
    if (evmAsset) {
      setCurrentEVMAssetValue(evmAsset.coin.amount)
    } else {
      setCurrentEVMAssetValue(BN_ZERO)
    }
  }, [evmAsset])

  const fetchRouteForEVMAsset = useCallback(async () => {
    const evmAsset = fundingAssets.find(
      (asset) => asset.chain && chainNameToUSDCAttributes[asset.chain],
    )

    if (!evmAsset || evmAsset.coin.amount.isZero()) {
      setCurrentRoute(undefined)
      setRouteError(null)
      return
    }

    if (isLoadingRoute) return

    setIsLoadingRoute(true)
    setRouteError(null)
    try {
      const route = await fetchSkipRoute(evmAsset)
      const bridgeLogos = await fetchBridgeLogos({ chainIDs: route.chainIDs })
      setBridges(bridgeLogos)
      setCurrentRoute(route)
    } catch (error) {
      console.error('Failed to fetch route:', error)
      setCurrentRoute(undefined)
      if (error instanceof Error && error.message.includes('no routes found')) {
        setRouteError(
          'No available routes found for this transfer. Please try again later or choose a different asset.',
        )
      } else {
        setRouteError('Failed to fetch route. Please try again later.')
      }
    } finally {
      setIsLoadingRoute(false)
    }
  }, [fetchSkipRoute, fundingAssets, isLoadingRoute, fetchBridgeLogos])

  useEffect(() => {
    updateEVMAssetValue()
  }, [fundingAssets, updateEVMAssetValue])

  useEffect(() => {
    const evmAsset = fundingAssets.find(
      (asset) => asset.chain && chainNameToUSDCAttributes[asset.chain],
    )

    if (evmAsset && !evmAsset.coin.amount.isZero()) {
      setPreviousEVMAmount(evmAsset.coin.amount)
    }

    const amountToCheck = evmAsset ? evmAsset.coin.amount : previousEVMAmount

    setShowMinimumUSDCValueOverlay(
      evmAsset !== undefined && !amountToCheck.isZero() && amountToCheck.isLessThan(MINIMUM_USDC),
    )
  }, [previousEVMAmount, fundingAssets, currentEVMAssetValue])

  useEffect(() => {
    const timer = setTimeout(() => {
      const evmAsset = fundingAssets.find(
        (asset) => asset.chain && chainNameToUSDCAttributes[asset.chain],
      )

      if (evmAsset && !evmAsset.coin.amount.isZero() && !isEVMAssetLessThanMinimumUSDC) {
        fetchRouteForEVMAsset()
      }
    }, 500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goFast, currentEVMAssetValue])

  return {
    goFast,
    setGoFast,
    currentRoute,
    routeError,
    bridges,
    isLoadingRoute,
    evmAsset,
    currentEVMAssetValue,
    showMinimumUSDCValueOverlay,
    setShowMinimumUSDCValueOverlay,
    isEVMAssetLessThanMinimumUSDC,
    isBridgeInProgress,
    handleSkipTransfer,
    updateEVMAssetValue,
  }
}
