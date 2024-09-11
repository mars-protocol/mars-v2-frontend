import { useEffect, useMemo } from 'react'

import { BN_ZERO } from '../../../../constants/math'
import useDepositEnabledAssets from '../../../../hooks/assets/useDepositEnabledAssets'
import { BNCoin } from '../../../../types/classes/BNCoin'
import { getCoinAmount, getCoinValue } from '../../../../utils/formatters'
import { BN } from '../../../../utils/helpers'
import {
  getDepositCapMessage,
  getHealthFactorMessage,
  getLiquidityMessage,
  getNoBalanceInWalletMessage,
} from '../../../../utils/messages'
import CreateAccount from './CreateAccount'
import Leverage from './Leverage'
import ProvideCollateral from './ProvideCollateral'
import SelectAccount from './SelectAccount'
import { CollateralSubTitle, LeverageSubTitle, SelectAccountSubTitle } from './SubTitles'
import Summary from './Summary'

interface Props {
  apy: number
  borrowAmount: BigNumber
  borrowMarket: Market
  collateralAsset: Asset
  depositAmount: BigNumber
  emptyHlsAccounts: Account[]
  execute: () => void
  hlsAccounts: Account[]
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
  updatedAccount: Account | undefined
  walletCollateralAsset: Coin | undefined
}

export default function useAccordionItems(props: Props) {
  const assets = useDepositEnabledAssets()

  const depositCapLeft = useMemo(() => {
    if (!props.strategy) return BN_ZERO
    return props.strategy?.depositCap.max.minus(props.strategy.depositCap.used)
  }, [props.strategy])

  const borrowLiquidity = useMemo(
    () => props.borrowMarket.liquidity || BN_ZERO,
    [props.borrowMarket.liquidity],
  )

  const additionalDepositFromSwap = useMemo(() => {
    const value = getCoinValue(
      BNCoin.fromDenomAndBigNumber(props.borrowMarket.asset.denom, props.borrowAmount),
      assets,
    )
    return getCoinAmount(props.collateralAsset.denom, value, assets)
  }, [assets, props.borrowAmount, props.borrowMarket.asset.denom, props.collateralAsset.denom])

  const collateralWarningMessages = useMemo(() => {
    const messages: string[] = []
    if (!props.walletCollateralAsset?.amount) {
      messages.push(getNoBalanceInWalletMessage(props.collateralAsset.symbol))
    }

    if (props.depositAmount.isGreaterThan(depositCapLeft)) {
      messages.push(
        getDepositCapMessage(props.collateralAsset.denom, depositCapLeft, 'deposit', assets),
      )
    }

    return messages
  }, [
    assets,
    depositCapLeft,
    props.collateralAsset.denom,
    props.collateralAsset.symbol,
    props.depositAmount,
    props.walletCollateralAsset?.amount,
  ])

  const borrowWarningMessages = useMemo(() => {
    const messages: string[] = []

    if (props.borrowAmount.isGreaterThan(props.maxBorrowAmount)) {
      messages.push(
        getHealthFactorMessage(
          props.borrowMarket.asset.denom,
          props.maxBorrowAmount,
          'borrow',
          assets,
        ),
      )
    }

    if (props.borrowAmount.isGreaterThan(borrowLiquidity)) {
      messages.push(getLiquidityMessage(props.borrowMarket.asset.denom, borrowLiquidity, assets))
    }

    if (additionalDepositFromSwap.plus(props.depositAmount).isGreaterThan(depositCapLeft)) {
      messages.push(
        getDepositCapMessage(props.borrowMarket.asset.denom, depositCapLeft, 'borrow', assets),
      )
    }

    return messages
  }, [
    additionalDepositFromSwap,
    assets,
    borrowLiquidity,
    depositCapLeft,
    props.borrowAmount,
    props.borrowMarket.asset.denom,
    props.depositAmount,
    props.maxBorrowAmount,
  ])

  useEffect(() => {
    const element = document.getElementById(`item-${props.isOpen.findIndex((v) => v)}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }, [props.isOpen])

  return useMemo(() => {
    return [
      {
        title: 'Provide Collateral',
        renderContent: () => (
          <ProvideCollateral
            amount={props.depositAmount}
            onChangeAmount={props.onChangeCollateral}
            asset={props.collateralAsset}
            onClickBtn={() => props.toggleIsOpen(1)}
            max={BN(props.walletCollateralAsset?.amount || 0)}
            depositCapLeft={depositCapLeft}
            warningMessages={collateralWarningMessages}
          />
        ),
        renderSubTitle: () => (
          <CollateralSubTitle
            isOpen={props.isOpen[0]}
            amount={props.depositAmount}
            denom={props.collateralAsset.denom}
            warningMessages={collateralWarningMessages}
          />
        ),
        isOpen: props.isOpen[0],

        toggleOpen: props.toggleIsOpen,
      },
      {
        title: 'Leverage',
        renderContent: () => (
          <Leverage
            leverage={props.leverage}
            amount={props.borrowAmount}
            borrowMarket={props.borrowMarket}
            onChangeAmount={props.onChangeDebt}
            onClickBtn={() => props.toggleIsOpen(2)}
            max={props.maxBorrowAmount}
            positionValue={props.positionValue}
            maxLeverage={props.strategy?.maxLeverage || 1}
            baseApy={props.strategy?.apy || 0}
            warningMessages={borrowWarningMessages}
          />
        ),
        renderSubTitle: () => (
          <LeverageSubTitle
            leverage={props.leverage}
            isOpen={props.isOpen[1]}
            positionValue={props.positionValue}
            warningMessages={borrowWarningMessages}
          />
        ),
        isOpen: props.isOpen[1],
        toggleOpen: props.toggleIsOpen,
      },
      ...[
        props.emptyHlsAccounts.length > 0
          ? {
              title: 'Select Hls Account',
              renderContent: () => (
                <SelectAccount
                  selectedAccount={props.selectedAccount}
                  onChangeSelected={props.setSelectedAccount}
                  hlsAccounts={props.emptyHlsAccounts}
                  onClickBtn={() => props.toggleIsOpen(3)}
                />
              ),
              renderSubTitle: () => (
                <SelectAccountSubTitle
                  isOpen={props.isOpen[2]}
                  isSummaryOpen={props.isOpen[3] || props.isOpen.every((i) => !i)}
                  selectedAccountId={props.selectedAccount?.id}
                  type='select'
                />
              ),
              isOpen: props.isOpen[2],
              toggleOpen: props.toggleIsOpen,
            }
          : {
              title: 'Create Hls Account',
              renderContent: () => <CreateAccount />,
              renderSubTitle: () => (
                <SelectAccountSubTitle
                  isOpen={props.isOpen[2]}
                  isSummaryOpen={props.isOpen[3] || props.isOpen.every((i) => !i)}
                  selectedAccountId={props.selectedAccount?.id}
                  type='create'
                />
              ),
              isOpen: props.isOpen[2],
              toggleOpen: props.toggleIsOpen,
            },
      ],
      {
        title: 'Summary',
        renderContent: () => (
          <Summary
            depositAmount={props.depositAmount}
            borrowAmount={props.borrowAmount}
            leverage={props.leverage}
            positionValue={props.positionValue}
            collateralAsset={props.collateralAsset}
            borrowMarket={props.borrowMarket}
            apy={props.apy}
            onClickBtn={props.execute}
            disabled={
              collateralWarningMessages.length > 0 ||
              borrowWarningMessages.length > 0 ||
              props.depositAmount.isZero() ||
              !props.selectedAccount
            }
          />
        ),
        renderSubTitle: () => null,
        isOpen: props.isOpen[3],
        toggleOpen: props.toggleIsOpen,
      },
    ]
  }, [borrowWarningMessages, collateralWarningMessages, depositCapLeft, props])
}
