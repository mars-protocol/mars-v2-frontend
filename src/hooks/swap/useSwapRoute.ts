import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'

import getNeutronRouteInfo from 'api/swap/getNeutronRouteInfo'
import getOsmosisRouteInfo from 'api/swap/getOsmosisRouteInfo'
import { getDepositAndLendCoinsToSpend } from 'hooks/accounts/useUpdatedAccount/functions'
import useAdjustedSwapFee from 'hooks/staking/useAdjustedSwapFee'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'

export interface RouteHop {
  tokenSymbol: string
  tokenDenom: string
}

export interface SwapRouteDetails {
  expectedOutput: BigNumber | undefined
  priceImpact: number
  route: RouteHop[]
  isLoading: boolean
  routeDescription?: string
}

/**
 * Custom hook to fetch and process swap route information
 * @param fromDenom Source asset denom
 * @param toDenom Target asset denom
 * @param amount Amount to swap (in source asset)
 * @param enabled Whether to enable the swap route calculation
 * @returns Swap route details
 */
export default function useSwapRoute(
  fromDenom: string,
  toDenom: string,
  amount: BigNumber,
  enabled = true,
): SwapRouteDetails {
  const chainConfig = useStore((s) => s.chainConfig)
  const assets = useStore((s) => s.assets)
  const adjustedSwapFee = useAdjustedSwapFee(chainConfig.swapFee)
  const [swapDetails, setSwapDetails] = useState<SwapRouteDetails>({
    expectedOutput: undefined,
    priceImpact: 0,
    route: [],
    isLoading: false,
    routeDescription: undefined,
  })

  useEffect(() => {
    async function fetchSwapRoute() {
      if (!enabled || !amount.isGreaterThan(0)) {
        setSwapDetails((prev) => ({
          ...prev,
          expectedOutput: undefined,
          isLoading: false,
        }))
        return
      }

      setSwapDetails((prev) => ({ ...prev, isLoading: true }))

      const isOsmosis = chainConfig.isOsmosis

      const osmosisUrl = `${chainConfig.endpoints.routes}/quote?tokenIn=${amount}${fromDenom}&tokenOutDenom=${toDenom}`

      try {
        const routeInfo = isOsmosis
          ? await getOsmosisRouteInfo(osmosisUrl, fromDenom, assets, chainConfig, adjustedSwapFee)
          : await getNeutronRouteInfo(
              fromDenom,
              toDenom,
              amount,
              assets,
              chainConfig,
              adjustedSwapFee,
            )

        if (routeInfo) {
          const fromAsset = assets.find((a) => a.denom === fromDenom)
          const toAsset = assets.find((a) => a.denom === toDenom)

          const basicRoute: RouteHop[] = []
          if (fromAsset) {
            basicRoute.push({
              tokenSymbol: fromAsset.symbol,
              tokenDenom: fromDenom,
            })
          }
          if (toAsset && toAsset.denom !== fromDenom) {
            basicRoute.push({
              tokenSymbol: toAsset.symbol,
              tokenDenom: toDenom,
            })
          }

          let routeDescription = routeInfo.description
          if (routeDescription) {
            routeDescription = routeDescription.replace(/ -> /g, ' → ')
          }

          setSwapDetails({
            expectedOutput: routeInfo.amountOut,
            priceImpact: routeInfo.priceImpact ? Math.abs(routeInfo.priceImpact.toNumber()) : 0,
            route: basicRoute,
            isLoading: false,
            routeDescription,
          })
        } else {
          const fallbackRoute = createBasicRoute(fromDenom, toDenom, assets)

          setSwapDetails((prev) => ({
            ...prev,
            isLoading: false,
            route: fallbackRoute,
          }))
        }
      } catch (error) {
        console.error('Error fetching swap route:', error)
        const fallbackRoute = createBasicRoute(fromDenom, toDenom, assets)

        setSwapDetails((prev) => ({
          ...prev,
          isLoading: false,
          route: fallbackRoute,
        }))
      }
    }

    fetchSwapRoute()
  }, [fromDenom, toDenom, amount, enabled, chainConfig, assets, adjustedSwapFee])

  return swapDetails
}

function createBasicRoute(fromDenom: string, toDenom: string, assets: Asset[]): RouteHop[] {
  const fromAsset = assets.find((a) => a.denom === fromDenom)
  const toAsset = assets.find((a) => a.denom === toDenom)

  const fallbackRoute: RouteHop[] = []
  if (fromAsset) {
    fallbackRoute.push({
      tokenSymbol: fromAsset.symbol,
      tokenDenom: fromDenom,
    })
  }
  if (toAsset) {
    fallbackRoute.push({
      tokenSymbol: toAsset.symbol,
      tokenDenom: toDenom,
    })
  }

  return fallbackRoute
}

/**
 * Utility function to repay a loan with a combination of debt and swappable assets
 * @param params Configuration for the combined repay
 * @returns Promise<boolean> Whether the operation was successful
 */
export async function combinedRepay(params: {
  accountId: string
  debtAsset: Asset
  debtAmount: BigNumber
  swapAsset: Asset
  swapAmount: BigNumber
  fromWallet: boolean
  slippage: number
  account: Account
}): Promise<boolean> {
  const { accountId, debtAsset, debtAmount, swapAsset, swapAmount, fromWallet, slippage, account } =
    params

  const store = useStore.getState()

  if (debtAmount.isZero() && swapAmount.isZero()) return false

  try {
    // Case 1: Only repaying with debt asset, no swap needed
    if (debtAmount.isGreaterThan(0) && swapAmount.isZero()) {
      const { lend } = getDepositAndLendCoinsToSpend(
        BNCoin.fromDenomAndBigNumber(debtAsset.denom, debtAmount),
        account,
      )
      const currentDebt = account.debts.find(byDenom(debtAsset.denom))
      const isMaxRepayment =
        currentDebt && debtAmount.isGreaterThanOrEqualTo(currentDebt.amount.times(0.99)) // use account_balance for max repayments to handle dust

      return store.repay({
        accountId,
        coin: BNCoin.fromDenomAndBigNumber(debtAsset.denom, debtAmount),
        accountBalance: isMaxRepayment,
        lend: fromWallet ? BNCoin.fromDenomAndBigNumber(debtAsset.denom, new BigNumber(0)) : lend,
        fromWallet,
      })
    }

    // Case 2: Only repaying via swap, no direct debt asset repayment
    if (swapAmount.isGreaterThan(0) && debtAmount.isZero()) {
      const { lend } = getDepositAndLendCoinsToSpend(
        BNCoin.fromDenomAndBigNumber(swapAsset.denom, swapAmount),
        account,
      )

      return store.repay({
        accountId,
        coin: BNCoin.fromDenomAndBigNumber(swapAsset.denom, swapAmount),
        accountBalance: false, // Specific amount for the swap
        lend: fromWallet ? BNCoin.fromDenomAndBigNumber(swapAsset.denom, new BigNumber(0)) : lend,
        fromWallet,
        swapFromDenom: swapAsset.denom,
        debtDenom: debtAsset.denom,
        slippage,
      })
    }

    // Case 3: Combined repayment using both debt asset and swap
    if (debtAmount.isGreaterThan(0) && swapAmount.isGreaterThan(0)) {
      // First handle the swap portion
      const swapLend = getDepositAndLendCoinsToSpend(
        BNCoin.fromDenomAndBigNumber(swapAsset.denom, swapAmount),
        account,
      ).lend

      const swapSuccess = await store.repay({
        accountId,
        coin: BNCoin.fromDenomAndBigNumber(swapAsset.denom, swapAmount),
        accountBalance: false, // Specific amount for the swap
        lend: fromWallet
          ? BNCoin.fromDenomAndBigNumber(swapAsset.denom, new BigNumber(0))
          : swapLend,
        fromWallet,
        swapFromDenom: swapAsset.denom,
        debtDenom: debtAsset.denom,
        slippage,
      })

      if (!swapSuccess) return false

      // Then handle the direct debt asset repayment
      const debtLend = getDepositAndLendCoinsToSpend(
        BNCoin.fromDenomAndBigNumber(debtAsset.denom, debtAmount),
        account,
      ).lend

      const currentDebt = account.debts.find(byDenom(debtAsset.denom))
      const isMaxRepayment =
        currentDebt && debtAmount.isGreaterThanOrEqualTo(currentDebt.amount.times(0.99)) // use account_balance for max repayments to handle dust

      return store.repay({
        accountId,
        coin: BNCoin.fromDenomAndBigNumber(debtAsset.denom, debtAmount),
        accountBalance: isMaxRepayment,
        lend: fromWallet
          ? BNCoin.fromDenomAndBigNumber(debtAsset.denom, new BigNumber(0))
          : debtLend,
        fromWallet,
      })
    }

    return false
  } catch (error) {
    console.error('Combined repay failed:', error)
    return false
  }
}
