import { useMemo, useState } from 'react'

import { BN_ZERO } from 'constants/math'
import usePrices from 'hooks/usePrices'
import { BNCoin } from 'types/classes/BNCoin'
import { getValueFromBNCoins } from 'utils/helpers'

interface Props {
  vault: Vault
}
export default function useDepositHlsVault(props: Props) {
  const { data: prices } = usePrices()

  const [depositAmount, setDepositAmount] = useState<BigNumber>(BN_ZERO)
  const [borrowAmount, setBorrowAmount] = useState<BigNumber>(BN_ZERO)

  const positionValue = useMemo(() => {
    if (!prices.length) return BN_ZERO

    return getValueFromBNCoins(
      [
        BNCoin.fromDenomAndBigNumber(props.vault.denoms.primary, depositAmount),
        BNCoin.fromDenomAndBigNumber(props.vault.denoms.secondary, borrowAmount),
      ],
      prices,
    )
  }, [prices, depositAmount, borrowAmount])

  return {
    setDepositAmount,
    depositAmount,
    setBorrowAmount,
    borrowAmount,
    positionValue,
  }
}
