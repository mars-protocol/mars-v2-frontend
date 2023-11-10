import { useMemo } from 'react'

import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { BN_ZERO } from 'constants/math'
import useLocalStorage from 'hooks/useLocalStorage'
import usePrices from 'hooks/usePrices'
import { BNCoin } from 'types/classes/BNCoin'
import { Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { getCoinAmount, getCoinValue } from 'utils/formatters'

interface Props {
  account: HLSAccountWithStrategy
}

export default function UseClosePositionActions(props: Props): Action[] {
  const [slippage] = useLocalStorage<number>(LocalStorageKeys.SLIPPAGE, DEFAULT_SETTINGS.slippage)
  const { data: prices } = usePrices()

  const collateralDenom = props.account.strategy.denoms.deposit
  const borrowDenom = props.account.strategy.denoms.borrow

  const debtAmount: BigNumber = useMemo(
    () =>
      props.account.debts.find((debt) => debt.denom === props.account.strategy.denoms.borrow)
        ?.amount || BN_ZERO,
    [props.account.debts, props.account.strategy.denoms.borrow],
  )

  const swapInAmount = useMemo(() => {
    const targetValue = getCoinValue(BNCoin.fromDenomAndBigNumber(borrowDenom, debtAmount), prices)
    return getCoinAmount(collateralDenom, targetValue, prices)
      .times(1 + slippage)
      .integerValue()
  }, [slippage, borrowDenom, debtAmount, prices, collateralDenom])

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
                coin: BNCoin.fromDenomAndBigNumber(borrowDenom, debtAmount).toActionCoin(),
              },
            },
          ]),
      { refund_all_coin_balances: {} },
    ],
    [borrowDenom, collateralDenom, debtAmount, slippage, swapInAmount],
  )
}
