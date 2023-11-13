import { useCallback, useMemo } from 'react'

import useDepositHlsVault from 'hooks/useDepositHlsVault'
import useHealthComputer from 'hooks/useHealthComputer'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  borrowAsset: Asset
  collateralAsset: Asset
  selectedAccount: Account
}

export default function useStakingController(props: Props) {
  const { collateralAsset, borrowAsset, selectedAccount } = props
  const addToStakingStrategy = useStore((s) => s.addToStakingStrategy)

  const {
    leverage,
    setDepositAmount,
    depositAmount,
    setBorrowAmount,
    borrowAmount,
    positionValue,
    actions,
  } = useDepositHlsVault({
    collateralDenom: collateralAsset.denom,
    borrowDenom: borrowAsset.denom,
  })

  const { updatedAccount, addDeposits } = useUpdatedAccount(selectedAccount)
  const { computeMaxBorrowAmount } = useHealthComputer(updatedAccount)

  const maxBorrowAmount = useMemo(() => {
    // TODO: Perhaps we need a specific target for this -> target = swap
    return computeMaxBorrowAmount(props.borrowAsset.denom, 'deposit')
  }, [computeMaxBorrowAmount, props.borrowAsset.denom])

  const execute = useCallback(() => {
    useStore.setState({ hlsModal: null })
    addToStakingStrategy({
      actions,
      accountId: selectedAccount.id,
      borrowCoin: BNCoin.fromDenomAndBigNumber(borrowAsset.denom, borrowAmount),
      depositCoin: BNCoin.fromDenomAndBigNumber(collateralAsset.denom, depositAmount),
    })
  }, [
    actions,
    addToStakingStrategy,
    borrowAmount,
    borrowAsset.denom,
    collateralAsset.denom,
    depositAmount,
    selectedAccount.id,
  ])

  const onChangeCollateral = useCallback(
    (amount: BigNumber) => {
      setDepositAmount(amount)
      addDeposits([BNCoin.fromDenomAndBigNumber(collateralAsset.denom, amount)])
    },
    [addDeposits, collateralAsset.denom, setDepositAmount],
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
    maxBorrowAmount,
    onChangeCollateral,
    onChangeDebt,
    positionValue,
    updatedAccount,
  }
}
