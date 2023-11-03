import { useMemo, useState } from 'react'

import { BN_ZERO } from 'constants/math'
import usePrices from 'hooks/usePrices'
import { BNCoin } from 'types/classes/BNCoin'
import { getCoinValue } from 'utils/formatters'

interface Props {
  borrowDenom: string
  collateralDenom: string
}
export default function useDepositHlsVault(props: Props) {
  const { data: prices } = usePrices()

  const [depositAmount, setDepositAmount] = useState<BigNumber>(BN_ZERO)
  const [borrowAmount, setBorrowAmount] = useState<BigNumber>(BN_ZERO)

  const { positionValue, leverage } = useMemo(() => {
    const collateralValue = getCoinValue(
      BNCoin.fromDenomAndBigNumber(props.collateralDenom, depositAmount),
      prices,
    )
    const borrowValue = getCoinValue(
      BNCoin.fromDenomAndBigNumber(props.borrowDenom, borrowAmount),
      prices,
    )

    return {
      positionValue: collateralValue.plus(borrowValue),
      leverage: borrowValue.dividedBy(collateralValue).plus(1).toNumber() || 1,
    }
  }, [borrowAmount, depositAmount, prices, props.collateralDenom, props.borrowDenom])

  return {
    setDepositAmount,
    depositAmount,
    setBorrowAmount,
    borrowAmount,
    positionValue,
    leverage,
  }
}
