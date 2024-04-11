import { useCallback, useMemo } from 'react'

import useDepositVault from 'hooks/broadcast/useDepositVault'
import useDepositHlsVault from 'hooks/hls/useDepositHlsVault'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  borrowMarket: Market
  collateralAsset: Asset
  selectedAccount: Account
  vault: Vault
}

export default function useVaultController(props: Props) {
  const { vault, collateralAsset, borrowMarket, selectedAccount } = props

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
    borrowDenom: borrowMarket.asset.denom,
  })

  const { actions } = useDepositVault({
    vault,
    reclaims: [],
    deposits: [BNCoin.fromDenomAndBigNumber(collateralAsset.denom, depositAmount)],
    borrowings: [BNCoin.fromDenomAndBigNumber(borrowMarket.asset.denom, borrowAmount)],
    kind: 'high_levered_strategy' as AccountKind,
  })

  const { updatedAccount, simulateVaultDeposit } = useUpdatedAccount(selectedAccount)
  const { computeMaxBorrowAmount } = useHealthComputer(updatedAccount)

  const maxBorrowAmount = useMemo(() => {
    return computeMaxBorrowAmount(props.borrowMarket.asset.denom, {
      vault: { address: props.vault?.address },
    }).plus(borrowAmount)
  }, [borrowAmount, computeMaxBorrowAmount, props.borrowMarket.asset.denom, props.vault?.address])

  const execute = useCallback(() => {
    depositIntoVault({
      accountId: selectedAccount.id,
      actions,
      deposits: [BNCoin.fromDenomAndBigNumber(collateralAsset.denom, depositAmount)],
      borrowings: [BNCoin.fromDenomAndBigNumber(borrowMarket.asset.denom, borrowAmount)],
      isCreate: true,
      kind: 'high_levered_strategy' as AccountKind,
    })
    useStore.setState({ hlsModal: null })
  }, [
    actions,
    borrowAmount,
    depositAmount,
    depositIntoVault,
    borrowMarket.asset.denom,
    collateralAsset.denom,
    selectedAccount.id,
  ])

  const onChangeCollateral = useCallback(
    (amount: BigNumber) => {
      setDepositAmount(amount)

      simulateVaultDeposit(
        vault.address,
        [BNCoin.fromDenomAndBigNumber(collateralAsset.denom, amount)],
        [BNCoin.fromDenomAndBigNumber(borrowMarket.asset.denom, borrowAmount)],
      )
    },
    [
      borrowAmount,
      borrowMarket,
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
        [BNCoin.fromDenomAndBigNumber(borrowMarket.asset.denom, amount)],
      )
    },
    [
      borrowMarket,
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
