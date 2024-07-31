import { useCallback, useMemo, useState } from 'react'

import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import useLendEnabledAssets from 'hooks/assets/useLendEnabledAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useDepositHlsVault from 'hooks/hls/useDepositHlsVault'
import useSlippage from 'hooks/settings/useSlippage'
import useAutoLend from 'hooks/wallet/useAutoLend'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { getFarmActions } from 'utils/farm'

interface Props {
  borrowMarket: Market
  collateralAsset: Asset
  selectedAccount: Account
  vault: Vault
}

export default function useVaultController(props: Props) {
  const { vault, collateralAsset, borrowMarket, selectedAccount } = props
  const assets = useDepositEnabledAssets()
  const lendEnabledAssets = useLendEnabledAssets()
  const [slippage] = useSlippage()
  const chainConfig = useChainConfig()
  const { isAutoLendEnabledForCurrentAccount: isAutoLend } = useAutoLend()
  const depositIntoVault = useStore((s) => s.depositIntoVault)
  const [isCalculating, setIsCaluclating] = useState(false)

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

  const { updatedAccount, simulateVaultDeposit } = useUpdatedAccount(selectedAccount)
  const { computeMaxBorrowAmount } = useHealthComputer(updatedAccount)

  const maxBorrowAmount = useMemo(() => {
    return computeMaxBorrowAmount(props.borrowMarket.asset.denom, {
      vault: { address: props.vault?.address },
    }).plus(borrowAmount)
  }, [borrowAmount, computeMaxBorrowAmount, props.borrowMarket.asset.denom, props.vault?.address])

  const execute = useCallback(async () => {
    const actions = await getFarmActions(
      vault,
      [BNCoin.fromDenomAndBigNumber(collateralAsset.denom, depositAmount)],
      [],
      [BNCoin.fromDenomAndBigNumber(borrowMarket.asset.denom, borrowAmount)],
      assets,
      slippage,
      chainConfig,
      true,
      false,
    )
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
    assets,
    borrowAmount,
    borrowMarket.asset.denom,
    chainConfig,
    collateralAsset.denom,
    depositAmount,
    depositIntoVault,
    selectedAccount.id,
    slippage,
    vault,
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
