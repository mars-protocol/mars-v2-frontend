import { useCallback } from 'react'

import useDepositHlsVault from 'hooks/useDepositHlsVault'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'
import { BN } from 'utils/helpers'

interface Props {
  borrowAsset: Asset
  collateralAsset: Asset
  selectedAccount: Account
}

export default function useVaultController(props: Props) {
  const { collateralAsset, borrowAsset, selectedAccount } = props

  const {
    leverage,
    setDepositAmount,
    depositAmount,
    setBorrowAmount,
    borrowAmount,
    positionValue,
  } = useDepositHlsVault({
    collateralDenom: collateralAsset.denom,
    borrowDenom: borrowAsset.denom,
  })

  const actions = []

  const { updatedAccount, simulateVaultDeposit } = useUpdatedAccount(selectedAccount)

  const execute = () => null

  const onChangeCollateral = useCallback(
    (amount: BigNumber) => {
      setDepositAmount(amount)
    },
    [setDepositAmount],
  )

  const onChangeDebt = useCallback(
    (amount: BigNumber) => {
      setBorrowAmount(amount)
    },
    [setBorrowAmount],
  )

  return {
    borrowAmount,
    depositAmount,
    execute,
    leverage,
    maxBorrowAmount: BN(0),
    onChangeCollateral,
    onChangeDebt,
    positionValue,
    updatedAccount,
  }
}
