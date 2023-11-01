import React, { useMemo } from 'react'

import CreateAccount from 'components/Modals/HLS/CreateAccount'
import Leverage from 'components/Modals/HLS/Leverage'
import ProvideCollateral from 'components/Modals/HLS/ProvideCollateral'
import SelectAccount from 'components/Modals/HLS/SelectAccount'
import { CollateralSubTitle, LeverageSubTitle, SubTitle } from 'components/Modals/HLS/SubTitles'
import Summary from 'components/Modals/HLS/Summary'
import { BN } from 'utils/helpers'

interface Props {
  apy: number
  borrowAmount: BigNumber
  borrowAsset: Asset
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
  toggleIsOpen: (index: number) => void
  updatedAccount: Account | undefined
  walletCollateralAsset: Coin | undefined
}

export default function useAccordionItems(props: Props) {
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
            // TODO: Add check for deposit cap
            max={BN(props.walletCollateralAsset?.amount || 0)}
          />
        ),
        renderSubTitle: () => (
          <CollateralSubTitle
            isOpen={props.isOpen[0]}
            amount={props.depositAmount}
            denom={props.collateralAsset.denom}
          />
        ),
        isOpen: props.isOpen[0],

        toggleOpen: props.toggleIsOpen,
      },
      {
        title: 'Leverage',
        renderContent: () => (
          <Leverage
            account={props.updatedAccount}
            amount={props.borrowAmount}
            asset={props.borrowAsset}
            onChangeAmount={props.onChangeDebt}
            onClickBtn={() => props.toggleIsOpen(2)}
            max={props.maxBorrowAmount}
          />
        ),
        renderSubTitle: () => (
          <LeverageSubTitle
            leverage={props.leverage}
            isOpen={props.isOpen[1]}
            positionValue={props.positionValue}
          />
        ),
        isOpen: props.isOpen[1],
        toggleOpen: props.toggleIsOpen,
      },
      ...[
        props.hlsAccounts.length > 2
          ? {
              title: 'Select HLS Account',
              renderContent: () => (
                <SelectAccount
                  selectedAccount={props.selectedAccount}
                  onChangeSelected={props.setSelectedAccount}
                  hlsAccounts={props.emptyHlsAccounts}
                  onClickBtn={() => props.toggleIsOpen(3)}
                />
              ),
              renderSubTitle: () =>
                props.selectedAccount && !props.isOpen[2] ? (
                  <SubTitle text={`Account ${props.selectedAccount.id}`} />
                ) : null,
              isOpen: props.isOpen[2],
              toggleOpen: props.toggleIsOpen,
            }
          : {
              title: 'Create HLS Account',
              renderContent: () => <CreateAccount />,
              renderSubTitle: () => null,
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
            borrowAsset={props.borrowAsset}
            apy={props.apy}
            onClickBtn={props.execute}
          />
        ),
        renderSubTitle: () => null,
        isOpen: props.isOpen[3],
        toggleOpen: props.toggleIsOpen,
      },
    ]
  }, [props])
}
