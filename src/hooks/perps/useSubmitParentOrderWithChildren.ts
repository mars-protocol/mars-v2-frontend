import { useCallback } from 'react'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAutoLend from 'hooks/wallet/useAutoLend'
import { OrderType } from 'types/enums'
import BigNumber from 'bignumber.js'
import { ExecutePerpOrderType } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import useKeeperFee from 'hooks/perps/useKeeperFee'

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

        const params: any = {
          accountId: currentAccount.id,
          coin: BNCoin.fromDenomAndBigNumber(asset.denom, orderSize),
          reduceOnly: isReduceOnly,
          autolend: isAutoLendEnabledForCurrentAccount,
          baseDenom,
          keeperFee: keeperFee.calculateKeeperFee,
          orderType: perpOrderType,
          conditionalTriggers,
        }

        if (orderType === OrderType.LIMIT && limitPrice) {
          params.limitPrice = limitPrice.toString()
        } else if (orderType === OrderType.STOP && stopPrice) {
          params.stopPrice = stopPrice.toString()
        }

        return executeParentOrderWithConditionalTriggers(params)
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
