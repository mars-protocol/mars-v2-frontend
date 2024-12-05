import { useEffect, useMemo } from 'react'

import CreateAccount from 'components/Modals/Hls/Deposit/CreateAccount'
import Leverage from 'components/Modals/Hls/Deposit/Leverage'
import ProvideCollateral from 'components/Modals/Hls/Deposit/ProvideCollateral'
import SelectAccount from 'components/Modals/Hls/Deposit/SelectAccount'
import {
  CollateralSubTitle,
  LeverageSubTitle,
  SelectAccountSubTitle,
} from 'components/Modals/Hls/Deposit/SubTitles'
import HlsStakingSummary from 'components/Modals/Hls/Deposit/Summary/HlsStakingSummary'
import { BN_ZERO } from 'constants/math'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import { BNCoin } from 'types/classes/BNCoin'
import { getCoinAmount, getCoinValue } from 'utils/formatters'
import { BN } from 'utils/helpers'
import {
  getDepositCapMessage,
  getHealthFactorMessage,
  getLiquidityMessage,
  getNoBalanceInWalletMessage,
} from 'utils/messages'

interface Props {
  apy: number
  borrowAmount: BigNumber
  borrowMarket: Market
  collateralAsset: Asset
  depositAmount: BigNumber
  emptyHlsAccounts: Account[]
  execute: () => void
  isOpen: boolean[]
  leverage: number
  maxBorrowAmount: BigNumber
  onChangeCollateral: (amount: BigNumber) => void
  onChangeDebt: (amount: BigNumber) => void
  positionValue: BigNumber
  selectedAccount: Account | null
  setSelectedAccount: (account: Account) => void
  strategy?: HlsStrategy
  toggleIsOpen: (index: number) => void
  walletCollateralAsset: Coin | undefined
}

export default function useAccordionItems(props: Props) {
  const assets = useDepositEnabledAssets()
  const {
    apy,
    borrowAmount,
    borrowMarket,
    collateralAsset,
    depositAmount,
    emptyHlsAccounts,
    execute,
    isOpen,
    leverage,
    maxBorrowAmount,
    onChangeCollateral,
    onChangeDebt,
    positionValue,
    selectedAccount,
    setSelectedAccount,
    strategy,
    toggleIsOpen,
    walletCollateralAsset,
  } = props

  const depositCapLeft = useMemo(() => {
    if (!strategy) return BN_ZERO
    return strategy?.depositCap.max.minus(strategy.depositCap.used)
  }, [strategy])

  const borrowLiquidity = useMemo(() => borrowMarket.liquidity || BN_ZERO, [borrowMarket.liquidity])

  const additionalDepositFromSwap = useMemo(() => {
    const value = getCoinValue(
      BNCoin.fromDenomAndBigNumber(borrowMarket.asset.denom, borrowAmount),
      assets,
    )
    return getCoinAmount(collateralAsset.denom, value, assets)
  }, [assets, borrowAmount, borrowMarket.asset.denom, collateralAsset.denom])

  const collateralWarningMessages = useMemo(() => {
    const messages: string[] = []
    if (!walletCollateralAsset?.amount) {
      messages.push(getNoBalanceInWalletMessage(collateralAsset.symbol))
    }

    if (depositAmount.isGreaterThan(depositCapLeft)) {
      messages.push(getDepositCapMessage(collateralAsset.denom, depositCapLeft, 'deposit', assets))
    }

    return messages
  }, [
    assets,
    depositCapLeft,
    collateralAsset.denom,
    collateralAsset.symbol,
    depositAmount,
    walletCollateralAsset?.amount,
  ])

  const borrowWarningMessages = useMemo(() => {
    const messages: string[] = []

    if (borrowAmount.isGreaterThan(maxBorrowAmount)) {
      messages.push(
        getHealthFactorMessage(borrowMarket.asset.denom, maxBorrowAmount, 'borrow', assets),
      )
    }

    if (borrowAmount.isGreaterThan(borrowLiquidity)) {
      messages.push(getLiquidityMessage(borrowMarket.asset.denom, borrowLiquidity, assets))
    }

    if (additionalDepositFromSwap.plus(depositAmount).isGreaterThan(depositCapLeft)) {
      messages.push(
        getDepositCapMessage(borrowMarket.asset.denom, depositCapLeft, 'borrow', assets),
      )
    }

    return messages
  }, [
    additionalDepositFromSwap,
    assets,
    borrowLiquidity,
    depositCapLeft,
    borrowAmount,
    borrowMarket.asset.denom,
    depositAmount,
    maxBorrowAmount,
  ])

  useEffect(() => {
    const element = document.getElementById(`item-${isOpen.findIndex((v) => v)}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isOpen])

  return useMemo(() => {
    return [
      {
        title: 'Provide Collateral',
        renderContent: () => (
          <ProvideCollateral
            amount={depositAmount}
            onChangeAmount={onChangeCollateral}
            asset={collateralAsset}
            onClickBtn={() => toggleIsOpen(1)}
            max={BN(walletCollateralAsset?.amount || 0)}
            warningMessages={collateralWarningMessages}
          />
        ),
        renderSubTitle: () => (
          <CollateralSubTitle
            isOpen={isOpen[0]}
            amount={depositAmount}
            denom={collateralAsset.denom}
            warningMessages={collateralWarningMessages}
          />
        ),
        isOpen: isOpen[0],

        toggleOpen: toggleIsOpen,
      },
      {
        title: 'Leverage',
        renderContent: () => (
          <Leverage
            leverage={leverage}
            amount={borrowAmount}
            borrowMarket={borrowMarket}
            onChangeAmount={onChangeDebt}
            onClickBtn={() => toggleIsOpen(2)}
            max={maxBorrowAmount}
            positionValue={positionValue}
            maxLeverage={strategy?.maxLeverage || 1}
            baseApy={strategy?.apy || 0}
            warningMessages={borrowWarningMessages}
          />
        ),
        renderSubTitle: () => (
          <LeverageSubTitle
            leverage={leverage}
            isOpen={isOpen[1]}
            positionValue={positionValue}
            warningMessages={borrowWarningMessages}
          />
        ),
        isOpen: isOpen[1],
        toggleOpen: toggleIsOpen,
      },
      ...[
        emptyHlsAccounts.length > 0
          ? {
              title: 'Select Hls Account',
              renderContent: () => (
                <SelectAccount
                  selectedAccount={selectedAccount}
                  onChangeSelected={setSelectedAccount}
                  hlsAccounts={emptyHlsAccounts}
                  onClickBtn={() => toggleIsOpen(3)}
                />
              ),
              renderSubTitle: () => (
                <SelectAccountSubTitle
                  isOpen={isOpen[2]}
                  isSummaryOpen={isOpen[3] || isOpen.every((i) => !i)}
                  selectedAccountId={selectedAccount?.id}
                  type='select'
                />
              ),
              isOpen: isOpen[2],
              toggleOpen: toggleIsOpen,
            }
          : {
              title: 'Create Hls Account',
              renderContent: () => <CreateAccount />,
              renderSubTitle: () => (
                <SelectAccountSubTitle
                  isOpen={isOpen[2]}
                  isSummaryOpen={isOpen[3] || isOpen.every((i) => !i)}
                  selectedAccountId={selectedAccount?.id}
                  type='create'
                />
              ),
              isOpen: isOpen[2],
              toggleOpen: toggleIsOpen,
            },
      ],
      {
        title: 'Summary',
        renderContent: () => (
          <HlsStakingSummary
            depositAmount={depositAmount}
            borrowAmount={borrowAmount}
            leverage={leverage}
            positionValue={positionValue}
            collateralAsset={collateralAsset}
            borrowMarket={borrowMarket}
            apy={apy}
            onClickBtn={execute}
            disabled={
              collateralWarningMessages.length > 0 ||
              borrowWarningMessages.length > 0 ||
              depositAmount.isZero() ||
              !selectedAccount
            }
          />
        ),
        renderSubTitle: () => null,
        isOpen: isOpen[3],
        toggleOpen: toggleIsOpen,
      },
    ]
  }, [
    apy,
    borrowAmount,
    borrowMarket,
    borrowWarningMessages,
    collateralAsset,
    collateralWarningMessages,
    depositAmount,
    emptyHlsAccounts,
    execute,
    isOpen,
    leverage,
    maxBorrowAmount,
    onChangeCollateral,
    onChangeDebt,
    positionValue,
    selectedAccount,
    setSelectedAccount,
    strategy?.apy,
    strategy?.maxLeverage,
    toggleIsOpen,
    walletCollateralAsset?.amount,
  ])
}
