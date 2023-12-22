import { useMemo, useState } from 'react'

import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { BN_ZERO } from 'constants/math'
import useAllAssets from 'hooks/assets/useAllAssets'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import usePrices from 'hooks/usePrices'
import useSwapValueLoss from 'hooks/useSwapValueLoss'
import { BNCoin } from 'types/classes/BNCoin'
import { Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { SWAP_FEE_BUFFER } from 'utils/constants'
import { getCoinValue } from 'utils/formatters'

interface Props {
  borrowDenom: string
  collateralDenom: string
}
export default function useDepositHlsVault(props: Props) {
  const { data: prices } = usePrices()
  const [slippage] = useLocalStorage<number>(LocalStorageKeys.SLIPPAGE, DEFAULT_SETTINGS.slippage)
  const assets = useAllAssets()
  const { data: valueLossPercentage } = useSwapValueLoss(props.borrowDenom, props.collateralDenom)

  const [depositAmount, setDepositAmount] = useState<BigNumber>(BN_ZERO)
  const [borrowAmount, setBorrowAmount] = useState<BigNumber>(BN_ZERO)

  const depositCoin = useMemo(
    () => BNCoin.fromDenomAndBigNumber(props.collateralDenom, depositAmount),
    [depositAmount, props.collateralDenom],
  )

  const borrowCoin = useMemo(
    () => BNCoin.fromDenomAndBigNumber(props.borrowDenom, borrowAmount),
    [borrowAmount, props.borrowDenom],
  )

  const { positionValue, leverage } = useMemo(() => {
    const collateralValue = getCoinValue(
      BNCoin.fromDenomAndBigNumber(props.collateralDenom, depositAmount),
      prices,
      assets,
    )
    const borrowValue = getCoinValue(
      BNCoin.fromDenomAndBigNumber(props.borrowDenom, borrowAmount),
      prices,
      assets,
    )

    return {
      positionValue: collateralValue.plus(borrowValue),
      leverage:
        borrowValue
          .dividedBy(
            collateralValue
              .plus(borrowValue.times(1 - valueLossPercentage - SWAP_FEE_BUFFER))
              .minus(borrowValue),
          )
          .plus(1)
          .toNumber() || 1,
    }
  }, [
    props.collateralDenom,
    props.borrowDenom,
    depositAmount,
    prices,
    assets,
    borrowAmount,
    valueLossPercentage,
  ])

  const actions: Action[] = useMemo(
    () => [
      {
        deposit: depositCoin.toCoin(),
      },
      ...(borrowAmount.isZero()
        ? []
        : [
            {
              borrow: borrowCoin.toCoin(),
            },
            {
              swap_exact_in: {
                denom_out: props.collateralDenom,
                slippage: slippage.toString(),
                coin_in: BNCoin.fromDenomAndBigNumber(
                  props.borrowDenom,
                  borrowAmount,
                ).toActionCoin(),
              },
            },
          ]),
    ],
    [borrowAmount, borrowCoin, depositCoin, props.borrowDenom, props.collateralDenom, slippage],
  )

  return {
    setDepositAmount,
    depositAmount,
    setBorrowAmount,
    borrowAmount,
    positionValue,
    leverage,
    depositCoin,
    borrowCoin,
    actions,
  }
}
