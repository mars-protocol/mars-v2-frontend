import { useCallback } from 'react'
import { BNCoin } from 'types/classes/BNCoin'
import useStore from 'store'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAutoLend from 'hooks/wallet/useAutoLend'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import BigNumber from 'bignumber.js'

interface LimitOrderParams {
  asset: Asset
  orderSize: BigNumber
  limitPrice: BigNumber
  tradeDirection: TradeDirection
  baseDenom: string
  keeperFee: BNCoin
  isReduceOnly: boolean
  comparison: 'less_than' | 'greater_than'
}

export function useSubmitLimitOrder() {
  const currentAccount = useCurrentAccount()
  const { isAutoLendEnabledForCurrentAccount } = useAutoLend()

  const createTriggerOrder = useStore((s) => s.createTriggerOrder)
  const createMultipleTriggerOrders = useStore((s) => s.createMultipleTriggerOrders)

  const submitLimitOrder = useCallback(
    async (orderOrOrders: LimitOrderParams | LimitOrderParams[]) => {
      if (!currentAccount) return

      const orders = Array.isArray(orderOrOrders) ? orderOrOrders : [orderOrOrders]

      const triggerOrderParams = orders.map(
        ({
          asset,
          orderSize,
          limitPrice,
          tradeDirection,
          baseDenom,
          keeperFee,
          isReduceOnly,
          comparison,
        }) => {
          const decimalAdjustment = asset.decimals - PRICE_ORACLE_DECIMALS
          const adjustedLimitPrice = limitPrice.shiftedBy(-decimalAdjustment)

          return {
            accountId: currentAccount.id,
            coin: BNCoin.fromDenomAndBigNumber(asset.denom, orderSize),
            autolend: isAutoLendEnabledForCurrentAccount,
            baseDenom,
            keeperFee,
            tradeDirection,
            price: adjustedLimitPrice,
            reduceOnly: isReduceOnly,
            comparison,
          }
        },
      )

      if (triggerOrderParams.length === 1) {
        await createTriggerOrder(triggerOrderParams[0])
      } else {
        await createMultipleTriggerOrders({
          accountId: currentAccount.id,
          orders: triggerOrderParams,
        })
      }
    },
    [
      currentAccount,
      isAutoLendEnabledForCurrentAccount,
      createTriggerOrder,
      createMultipleTriggerOrders,
    ],
  )

  return submitLimitOrder
}
