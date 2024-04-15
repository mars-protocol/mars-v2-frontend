import { useCallback, useMemo } from 'react'

import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useDepositHlsVault from 'hooks/hls/useDepositHlsVault'
import useSwapValueLoss from 'hooks/hls/useSwapValueLoss'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { SWAP_FEE_BUFFER } from 'utils/constants'
import { BN } from 'utils/helpers'

interface Props {
  borrowMarket: Market
  collateralAsset: Asset
  selectedAccount: Account
}

export default function useStakingController(props: Props) {
  const { collateralAsset, borrowMarket, selectedAccount } = props
  const addToStakingStrategy = useStore((s) => s.addToStakingStrategy)

  const { data: swapValueLoss } = useSwapValueLoss(
    props.borrowMarket.asset.denom,
    props.collateralAsset.denom,
  )
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
    borrowDenom: borrowMarket.asset.denom,
  })

  const { updatedAccount, addDeposits } = useUpdatedAccount(selectedAccount)
  const { computeMaxBorrowAmount } = useHealthComputer(updatedAccount)

  const maxBorrowAmount = useMemo(() => {
    return computeMaxBorrowAmount(props.borrowMarket.asset.denom, {
      swap: {
        denom_out: props.collateralAsset.denom,
        slippage: BN(swapValueLoss).plus(SWAP_FEE_BUFFER).toString(),
      },
    })
  }, [
    computeMaxBorrowAmount,
    props.borrowMarket.asset.denom,
    props.collateralAsset.denom,
    swapValueLoss,
  ])

  const execute = useCallback(() => {
    useStore.setState({ hlsModal: null })
    addToStakingStrategy({
      actions,
      accountId: selectedAccount.id,
      borrowCoin: BNCoin.fromDenomAndBigNumber(borrowMarket.asset.denom, borrowAmount),
      depositCoin: BNCoin.fromDenomAndBigNumber(collateralAsset.denom, depositAmount),
    })
  }, [
    actions,
    addToStakingStrategy,
    borrowAmount,
    borrowMarket.asset.denom,
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
