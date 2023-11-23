import { useCallback, useMemo } from 'react'

import useDepositVault from 'hooks/broadcast/useDepositVault'
import useDepositHlsVault from 'hooks/useDepositHlsVault'
import useHealthComputer from 'hooks/useHealthComputer'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  borrowAsset: Asset
  collateralAsset: Asset
  selectedAccount: Account
  vault: Vault
}

export default function useVaultController(props: Props) {
  const { vault, collateralAsset, borrowAsset, selectedAccount } = props

  const depositIntoVault = useStore((s) => s.depositIntoVault)

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

  const { actions } = useDepositVault({
    vault,
    reclaims: [],
    deposits: [BNCoin.fromDenomAndBigNumber(collateralAsset.denom, depositAmount)],
    borrowings: [BNCoin.fromDenomAndBigNumber(borrowAsset.denom, borrowAmount)],
    kind: 'high_levered_strategy',
  })

  const { updatedAccount, simulateVaultDeposit } = useUpdatedAccount(selectedAccount)
  const { computeMaxBorrowAmount } = useHealthComputer(updatedAccount)

  const maxBorrowAmount = useMemo(() => {
    return computeMaxBorrowAmount(props.borrowAsset.denom, {
      vault: { address: props.vault?.address },
    }).plus(borrowAmount)
  }, [borrowAmount, computeMaxBorrowAmount, props.borrowAsset.denom, props.vault?.address])

  const execute = useCallback(() => {
    depositIntoVault({
      accountId: selectedAccount.id,
      actions,
      deposits: [BNCoin.fromDenomAndBigNumber(collateralAsset.denom, depositAmount)],
      borrowings: [BNCoin.fromDenomAndBigNumber(borrowAsset.denom, borrowAmount)],
      isCreate: true,
      kind: 'high_levered_strategy',
    })
    useStore.setState({ hlsModal: null })
  }, [
    actions,
    borrowAmount,
    depositAmount,
    depositIntoVault,
    borrowAsset.denom,
    collateralAsset.denom,
    selectedAccount.id,
  ])

  const onChangeCollateral = useCallback(
    (amount: BigNumber) => {
      setDepositAmount(amount)

      simulateVaultDeposit(
        vault.address,
        [BNCoin.fromDenomAndBigNumber(collateralAsset.denom, amount)],
        [BNCoin.fromDenomAndBigNumber(borrowAsset.denom, borrowAmount)],
      )
    },
    [
      borrowAmount,
      borrowAsset,
      collateralAsset,
      vault.address,
      setDepositAmount,
      simulateVaultDeposit,
    ],
  )

  const onChangeDebt = useCallback(
    (amount: BigNumber) => {
      setBorrowAmount(amount)

      simulateVaultDeposit(
        vault.address,
        [BNCoin.fromDenomAndBigNumber(collateralAsset.denom, depositAmount)],
        [BNCoin.fromDenomAndBigNumber(borrowAsset.denom, amount)],
      )
    },
    [
      borrowAsset,
      collateralAsset,
      depositAmount,
      vault.address,
      setBorrowAmount,
      simulateVaultDeposit,
    ],
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
