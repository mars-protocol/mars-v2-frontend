import { useCallback, useMemo } from 'react'

import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useDepositHlsVault from 'hooks/useDepositHlsVault'
import useHealthComputer from 'hooks/useHealthComputer'
import useLocalStorage from 'hooks/useLocalStorage'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

interface Props {
  borrowAsset: Asset
  collateralAsset: Asset
  selectedAccount: Account
}

export default function useVaultController(props: Props) {
  const { collateralAsset, borrowAsset, selectedAccount } = props
  const [slippage] = useLocalStorage<number>(LocalStorageKeys.SLIPPAGE, DEFAULT_SETTINGS.slippage)
  const addToStakingStrategy = useStore((s) => s.addToStakingStrategy)

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

  const depositCoin = useMemo(
    () => BNCoin.fromDenomAndBigNumber(collateralAsset.denom, depositAmount),
    [collateralAsset.denom, depositAmount],
  )

  const borrowCoin = useMemo(
    () => BNCoin.fromDenomAndBigNumber(borrowAsset.denom, borrowAmount),
    [borrowAsset.denom, borrowAmount],
  )

  const actions: Action[] = useMemo(
    () => [
      {
        deposit: depositCoin.toCoin(),
      },
      {
        borrow: borrowCoin.toCoin(),
      },
      {
        swap_exact_in: {
          denom_out: collateralAsset.denom,
          slippage: slippage.toString(),
          coin_in: BNCoin.fromDenomAndBigNumber(borrowAsset.denom, borrowAmount).toActionCoin(),
        },
      },
    ],
    [borrowAmount, borrowAsset.denom, borrowCoin, collateralAsset.denom, depositCoin, slippage],
  )

  const { updatedAccount, addDeposits } = useUpdatedAccount(selectedAccount)
  const { computeMaxBorrowAmount } = useHealthComputer(updatedAccount)

  const maxBorrowAmount = useMemo(() => {
    // TODO: Perhaps we need a specific target for this -> target = swap
    return computeMaxBorrowAmount(props.borrowAsset.denom, 'deposit')
  }, [computeMaxBorrowAmount, props.borrowAsset.denom])

  const execute = useCallback(() => {
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
