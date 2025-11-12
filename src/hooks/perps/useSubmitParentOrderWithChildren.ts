import BigNumber from 'bignumber.js'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { useKeeperFee } from 'hooks/perps/useKeeperFee'
import useAutoLend from 'hooks/wallet/useAutoLend'
import { useCallback } from 'react'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { OrderType } from 'types/enums'
import { ExecutePerpOrderType } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

export function useSubmitParentOrderWithChildren() {
  const currentAccount = useCurrentAccount()
  const { isAutoLendEnabledForCurrentAccount } = useAutoLend()
  const keeperFee = useKeeperFee()
  const executePerpOrder = useStore((s) => s.executePerpOrder)
  const executeParentOrderWithConditionalTriggers = useStore(
    (s) => s.executeParentOrderWithConditionalTriggers,
  )
  const address = useStore((s) => s.address)
  const chainConfig = useStore((s) => s.chainConfig)

  const submitParentOrderWithChildren = useCallback(
    async ({
      asset,
      amount,
      tradeDirection,
      baseDenom,
      orderType,
      limitPrice,
      stopPrice,
      isReduceOnly,
      conditionalTriggers,
      keeperFeeFromLends,
      keeperFeeFromBorrows,
    }: {
      asset: Asset
      amount: BigNumber
      tradeDirection: TradeDirection
      baseDenom: string
      orderType: OrderType
      limitPrice?: BigNumber
      stopPrice?: BigNumber
      isReduceOnly?: boolean
      conditionalTriggers: { sl: string | null; tp: string | null }
      keeperFeeFromLends: BNCoin
      keeperFeeFromBorrows: BNCoin
    }) => {
      if (!currentAccount || !chainConfig || !address) {
        console.error('Missing required dependencies:', {
          currentAccount: !!currentAccount,
          chainConfig: !!chainConfig,
          address: !!address,
        })
        return false
      }

      const orderSize =
        tradeDirection === 'short' && amount.isPositive() ? amount.negated() : amount

      const hasTriggers = !!(conditionalTriggers.tp ?? conditionalTriggers.sl)

      if (orderType === OrderType.MARKET && !hasTriggers) {
        return executePerpOrder({
          accountId: currentAccount.id,
          coin: BNCoin.fromDenomAndBigNumber(asset.denom, orderSize),
          reduceOnly: isReduceOnly,
          autolend: isAutoLendEnabledForCurrentAccount,
          baseDenom,
        })
      }

      try {
        const perpOrderType: ExecutePerpOrderType =
          orderType === OrderType.MARKET ? 'default' : 'parent'

        return executeParentOrderWithConditionalTriggers({
          accountId: currentAccount.id,
          coin: BNCoin.fromDenomAndBigNumber(asset.denom, orderSize),
          reduceOnly: isReduceOnly,
          autolend: isAutoLendEnabledForCurrentAccount,
          baseDenom,
          keeperFee: keeperFee.calculateKeeperFee,
          keeperFeeFromLends,
          keeperFeeFromBorrows,
          orderType: perpOrderType,
          conditionalTriggers,
          limitPrice:
            orderType === OrderType.LIMIT && limitPrice ? limitPrice.toString() : undefined,
          stopPrice: orderType === OrderType.STOP && stopPrice ? stopPrice.toString() : undefined,
        })
      } catch (error) {
        console.error('Error submitting parent order with children:', error)
        return false
      }
    },
    [
      currentAccount,
      isAutoLendEnabledForCurrentAccount,
      executePerpOrder,
      executeParentOrderWithConditionalTriggers,
      address,
      keeperFee,
      chainConfig,
    ],
  )

  return submitParentOrderWithChildren
}
