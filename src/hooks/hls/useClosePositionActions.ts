import BigNumber from 'bignumber.js'
import { useMemo } from 'react'

import { BN_ZERO } from 'constants/math'
import useAllWhitelistedAssets from 'hooks/assets/useAllWhitelistedAssets'
import useSwapValueLoss from 'hooks/hls/useSwapValueLoss'
import usePrices from 'hooks/prices/usePrices'
import useSlippage from 'hooks/settings/useSlippage'
import { BNCoin } from 'types/classes/BNCoin'
import { Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { SWAP_FEE_BUFFER } from 'utils/constants'
import { getCoinAmount, getCoinValue } from 'utils/formatters'

interface Props {
  account: HLSAccountWithStrategy
}

export default function UseClosePositionActions(props: Props): Action[] {
  const [slippage] = useSlippage()
  const { data: prices } = usePrices()
  const collateralDenom = props.account.strategy.denoms.deposit
  const borrowDenom = props.account.strategy.denoms.borrow
  const { data: swapValueLoss } = useSwapValueLoss(collateralDenom, borrowDenom)
  const assets = useAllWhitelistedAssets()
  const debtAmount: BigNumber = useMemo(
    () =>
      props.account.debts.find((debt) => debt.denom === props.account.strategy.denoms.borrow)
        ?.amount || BN_ZERO,
    [props.account.debts, props.account.strategy.denoms.borrow],
  )

  const collateralAmount: BigNumber = useMemo(
    () =>
      props.account.deposits.find(
        (deposit) => deposit.denom === props.account.strategy.denoms.deposit,
      )?.amount || BN_ZERO,
    [props.account.deposits, props.account.strategy.denoms.deposit],
  )

  const swapInAmount = useMemo(() => {
    const targetValue = getCoinValue(
      BNCoin.fromDenomAndBigNumber(borrowDenom, debtAmount),
      prices,
      assets,
    )
    return BigNumber.max(
      getCoinAmount(collateralDenom, targetValue, prices, assets)
        .times(1 + slippage + SWAP_FEE_BUFFER + swapValueLoss)
        .integerValue(),
      collateralAmount,
    )
  }, [
    borrowDenom,
    debtAmount,
    prices,
    assets,
    collateralDenom,
    slippage,
    swapValueLoss,
    collateralAmount,
  ])

  return useMemo<Action[]>(
    () => [
      ...(debtAmount.isZero()
        ? []
        : [
            {
              swap_exact_in: {
                coin_in: BNCoin.fromDenomAndBigNumber(collateralDenom, swapInAmount).toActionCoin(),
                denom_out: borrowDenom,
                slippage: slippage.toString(),
              },
            },
            {
              repay: {
                coin: BNCoin.fromDenomAndBigNumber(
                  borrowDenom,
                  debtAmount.times(1.0001).integerValue(), // Over pay to by-pass increase in debt
                ).toActionCoin(),
              },
            },
          ]),
      { refund_all_coin_balances: {} },
    ],
    [borrowDenom, collateralDenom, debtAmount, slippage, swapInAmount],
  )
}
