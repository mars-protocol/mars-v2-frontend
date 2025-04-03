import { BN_ZERO } from 'constants/math'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAutoLend from 'hooks/wallet/useAutoLend'
import { useCallback } from 'react'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'

interface LimitOrderParams {
  asset: Asset
  orderSize: BigNumber
  limitPrice: BigNumber
  tradeDirection: TradeDirection
  baseDenom: string
  keeperFee: BNCoin
  isReduceOnly: boolean
  comparison: TriggerType
  orderType?: CreateTriggerOrderType
  parentOrderId?: string
}

export function useSubmitLimitOrder() {
  const currentAccount = useCurrentAccount()
  const { isAutoLendEnabledForCurrentAccount } = useAutoLend()

  const createTriggerOrder = useStore((s) => s.createTriggerOrder)
  const createMultipleTriggerOrders = useStore((s) => s.createMultipleTriggerOrders)

  const submitLimitOrder = useCallback(
    async (singleOrMultipleOrders: LimitOrderParams | LimitOrderParams[]) => {
      if (!currentAccount) return

      const orders = Array.isArray(singleOrMultipleOrders)
        ? singleOrMultipleOrders
        : [singleOrMultipleOrders]

      const orderKeeperFee = orders[0].keeperFee
      const totalKeeperFeeAmount = orderKeeperFee.amount.times(orders.length)
      let keeperFeeAmountLeft = totalKeeperFeeAmount

      const keeperFeeTokenDepositsAmount =
        currentAccount.deposits.find(byDenom(orderKeeperFee.denom))?.amount ?? BN_ZERO

      keeperFeeAmountLeft = keeperFeeTokenDepositsAmount.isGreaterThan(totalKeeperFeeAmount)
        ? BN_ZERO
        : totalKeeperFeeAmount.minus(keeperFeeTokenDepositsAmount)

      const keeperFeeTokenLendsAmount =
        currentAccount.lends.find(byDenom(orderKeeperFee.denom))?.amount ?? BN_ZERO

      const keeperFeeFromLendsAmount = keeperFeeTokenLendsAmount.isGreaterThan(keeperFeeAmountLeft)
        ? keeperFeeAmountLeft
        : keeperFeeTokenLendsAmount

      keeperFeeAmountLeft = keeperFeeAmountLeft.minus(keeperFeeFromLendsAmount)

      const keeperFeeFromBorrowArmount = keeperFeeAmountLeft.isZero()
        ? BN_ZERO
        : keeperFeeAmountLeft

      const keeperFeeFromLends = BNCoin.fromDenomAndBigNumber(
        orderKeeperFee.denom,
        keeperFeeFromLendsAmount,
      )
      const keeperFeeFromBorrows = BNCoin.fromDenomAndBigNumber(
        orderKeeperFee.denom,
        keeperFeeFromBorrowArmount,
      )

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
          orderType,
          parentOrderId,
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
            isReduceOnly,
            comparison,
            orderType,
            parentOrderId,
          }
        },
      )

      if (triggerOrderParams.length === 1) {
        await createTriggerOrder({
          ...triggerOrderParams[0],
          keeperFeeFromLends,
          keeperFeeFromBorrows,
        })
      } else {
        await createMultipleTriggerOrders({
          accountId: currentAccount.id,
          keeperFeeFromLends,
          keeperFeeFromBorrows,
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
