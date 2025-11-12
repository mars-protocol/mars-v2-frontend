import BigNumber from 'bignumber.js'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { useKeeperFee } from 'hooks/perps/useKeeperFee'
import { useMemo } from 'react'
import { BNCoin } from 'types/classes/BNCoin'
import { OrderType } from 'types/enums'
import { byDenom } from 'utils/array'

interface KeeperFeeCalculation {
  totalKeeperFeeAmount: BigNumber
  keeperFeeFromLends: BNCoin
  keeperFeeFromBorrows: BNCoin
}

export function useKeeperFeeCalculation({
  orderType,
  conditionalTriggers,
  tradingFee,
  enabled,
}: {
  orderType: OrderType
  conditionalTriggers: { sl: string | null; tp: string | null }
  tradingFee?: { opening: BigNumber; closing: BigNumber }
  enabled: boolean
}): KeeperFeeCalculation {
  const currentAccount = useCurrentAccount()
  const keeperFee = useKeeperFee()

  // Extract stable primitive values for dependencies
  const keeperFeeDenom = keeperFee.calculateKeeperFee?.denom
  const keeperFeeAmount = keeperFee.calculateKeeperFee?.amount.toString()
  const tradingFeeOpeningStr = tradingFee?.opening.toString()
  const tradingFeeClosingStr = tradingFee?.closing.toString()

  return useMemo(() => {
    const emptyResult: KeeperFeeCalculation = {
      totalKeeperFeeAmount: BN_ZERO,
      keeperFeeFromLends: BNCoin.fromDenomAndBigNumber(keeperFee.calculateKeeperFee.denom, BN_ZERO),
      keeperFeeFromBorrows: BNCoin.fromDenomAndBigNumber(
        keeperFee.calculateKeeperFee.denom,
        BN_ZERO,
      ),
    }

    if (!enabled || !currentAccount) return emptyResult

    const hasTriggers = !!(conditionalTriggers.tp ?? conditionalTriggers.sl)
    if (!hasTriggers && orderType === OrderType.MARKET) return emptyResult

    const orderKeeperFee = keeperFee.calculateKeeperFee
    const numConditionalTriggers =
      (conditionalTriggers.tp ? 1 : 0) + (conditionalTriggers.sl ? 1 : 0)

    // For limit/stop orders (orderType !== MARKET), the parent order also needs keeper fee
    // For market orders, only the conditional triggers need keeper fees
    const totalTriggerOrders =
      orderType === OrderType.MARKET ? numConditionalTriggers : numConditionalTriggers + 1

    let totalKeeperFeeAmount = orderKeeperFee.amount.times(totalTriggerOrders)

    // For market orders, the execute_perp_order runs immediately and consumes trading fees
    // before the keeper fees are deducted. We need to account for this.
    // Limit orders don't have this issue because execute_perp_order is inside the trigger.
    if (orderType === OrderType.MARKET && numConditionalTriggers > 0) {
      let tradingFeeBuffer = BN_ZERO

      if (tradingFee) {
        const totalTradingFee = tradingFee.opening.plus(tradingFee.closing)
        tradingFeeBuffer = totalTradingFee.times(1.01).integerValue(BigNumber.ROUND_UP)
      }

      // If trading fee is 0 or very small, use 1% of keeper fees as minimum buffer
      // This accounts for trading fees that aren't captured in the API estimate
      const minBuffer = orderKeeperFee.amount
        .times(numConditionalTriggers)
        .times(0.01)
        .integerValue(BigNumber.ROUND_UP)
      tradingFeeBuffer = BigNumber.max(tradingFeeBuffer, minBuffer)

      totalKeeperFeeAmount = totalKeeperFeeAmount.plus(tradingFeeBuffer)
    }

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

    const keeperFeeFromBorrowAmount = keeperFeeAmountLeft.isZero() ? BN_ZERO : keeperFeeAmountLeft

    return {
      totalKeeperFeeAmount,
      keeperFeeFromLends: BNCoin.fromDenomAndBigNumber(
        orderKeeperFee.denom,
        keeperFeeFromLendsAmount,
      ),
      keeperFeeFromBorrows: BNCoin.fromDenomAndBigNumber(
        orderKeeperFee.denom,
        keeperFeeFromBorrowAmount,
      ),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enabled,
    currentAccount,
    keeperFeeDenom,
    keeperFeeAmount,
    orderType,
    conditionalTriggers.tp,
    conditionalTriggers.sl,
    tradingFeeOpeningStr,
    tradingFeeClosingStr,
  ])
}
