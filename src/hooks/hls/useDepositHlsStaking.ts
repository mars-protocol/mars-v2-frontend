import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import { BN_ZERO } from 'constants/math'
import { useMemo, useState } from 'react'
import useSlippage from 'hooks/settings/useSlippage'
import useRouteInfo from 'hooks/trade/useRouteInfo'
import { BNCoin } from 'types/classes/BNCoin'
import { Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { getCoinValue } from 'utils/formatters'
import { getSwapExactInAction } from 'utils/swap'

interface Props {
  borrowDenom: string
  collateralDenom: string
}
export default function useDepositHlsStaking(props: Props) {
  const [slippage] = useSlippage()
  const assets = useDepositEnabledAssets()
  const chainConfig = useChainConfig()

  const [depositAmount, setDepositAmount] = useState<BigNumber>(BN_ZERO)
  const [borrowAmount, setBorrowAmount] = useState<BigNumber>(BN_ZERO)

  const { data: route } = useRouteInfo(props.borrowDenom, props.collateralDenom, borrowAmount)

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
      assets,
    )
    const borrowValue = getCoinValue(
      BNCoin.fromDenomAndBigNumber(props.borrowDenom, borrowAmount),
      assets,
    )

    const swapOutputValue = getCoinValue(
      BNCoin.fromDenomAndBigNumber(props.collateralDenom, route?.amountOut || BN_ZERO),
      assets,
    )

    return {
      positionValue: collateralValue.plus(swapOutputValue),
      leverage:
        borrowValue
          .dividedBy(collateralValue.plus(borrowValue.times(1 - slippage)).minus(borrowValue))
          .plus(1)
          .toNumber() || 1,
    }
  }, [
    props.collateralDenom,
    props.borrowDenom,
    depositAmount,
    assets,
    borrowAmount,
    route?.amountOut,
    slippage,
  ])

  const actions: Action[] | null = useMemo(() => {
    const hasSwapAndRepay = !borrowAmount.isZero() && route
    return [
      {
        deposit: depositCoin.toCoin(),
      },
      ...(!hasSwapAndRepay
        ? []
        : [
            {
              borrow: borrowCoin.toCoin(),
            },
            getSwapExactInAction(
              BNCoin.fromDenomAndBigNumber(props.borrowDenom, borrowAmount).toActionCoin(),
              props.collateralDenom,
              route,
              slippage,
              chainConfig.isOsmosis,
            ),
          ]),
    ]
  }, [
    borrowAmount,
    route,
    depositCoin,
    borrowCoin,
    props.borrowDenom,
    props.collateralDenom,
    slippage,
    chainConfig.isOsmosis,
  ])

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
