import React, { useMemo, useState } from 'react'

import Accordion from 'components/Accordion'
import { Item } from 'components/AccordionContent'
import CreateAccount from 'components/Modals/HLS/CreateAccount'
import Leverage from 'components/Modals/HLS/Leverage'
import ProvideCollateral from 'components/Modals/HLS/ProvideCollateral'
import SelectAccount from 'components/Modals/HLS/SelectAccount'
import { CollateralSubTitle, LeverageSubTitle, SubTitle } from 'components/Modals/HLS/SubTitles'
import Summary from 'components/Modals/HLS/Summary'
import { BN_ZERO } from 'constants/math'
import useAccounts from 'hooks/useAccounts'
import useCurrentWalletBalance from 'hooks/useCurrentWalletBalance'
import useDepositHlsVault from 'hooks/useDepositHlsVault'
import useIsOpenArray from 'hooks/useIsOpenArray'
import useStore from 'store'
import { getAssetByDenom } from 'utils/assets'
import { BN } from 'utils/helpers'

interface Props {
  vault: Vault
}

export default function Content(props: Props) {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [isOpen, toggleIsOpen] = useIsOpenArray(4, false)
  const address = useStore((s) => s.address)
  const { data: hlsAccounts } = useAccounts('high_levered_strategy', address)
  const collateralAsset = getAssetByDenom(props.vault.denoms.primary)
  const borrowAsset = getAssetByDenom(props.vault.denoms.secondary)
  const walletCollateralAsset = useCurrentWalletBalance(props.vault.denoms.primary)
  const { setDepositAmount, depositAmount, setBorrowAmount, borrowAmount, positionValue } =
    useDepositHlsVault({
      vault: props.vault,
    })

  const items: Item[] = useMemo(() => {
    if (!collateralAsset || !borrowAsset) return []
    return [
      {
        title: 'Provide Collateral',
        renderContent: () => (
          <ProvideCollateral
            amount={depositAmount}
            onChangeAmount={setDepositAmount}
            asset={collateralAsset}
            onClickBtn={() => toggleIsOpen(1)}
            max={BN(walletCollateralAsset?.amount || 0)}
          />
        ),
        renderSubTitle: () => (
          <CollateralSubTitle
            isOpen={isOpen[0]}
            amount={depositAmount}
            denom={collateralAsset.denom}
          />
        ),
        isOpen: isOpen[0],

        toggleOpen: toggleIsOpen,
      },
      {
        title: 'Leverage',
        renderContent: () => (
          <Leverage
            amount={depositAmount}
            asset={borrowAsset}
            // TODO: Get max borrow amount
            max={BN_ZERO}
            onChangeAmount={setDepositAmount}
            onClickBtn={() => toggleIsOpen(2)}
          />
        ),
        renderSubTitle: () => (
          // TODO: Add leverage
          <LeverageSubTitle leverage={1.1} isOpen={isOpen[1]} positionValue={positionValue} />
        ),
        isOpen: isOpen[1],
        toggleOpen: toggleIsOpen,
      },
      ...[
        hlsAccounts.length > 2
          ? {
              title: 'Select HLS Account',
              renderContent: () => (
                <SelectAccount
                  selectedAccount={selectedAccount}
                  onChangeSelected={setSelectedAccount}
                  hlsAccounts={hlsAccounts}
                  onClickBtn={() => toggleIsOpen(3)}
                />
              ),
              renderSubTitle: () =>
                selectedAccount && !isOpen[2] ? (
                  <SubTitle text={`Account ${selectedAccount.id}`} />
                ) : null,
              isOpen: isOpen[2],
              toggleOpen: toggleIsOpen,
            }
          : {
              title: 'Create HLS Account',
              renderContent: () => <CreateAccount />,
              renderSubTitle: () => null,
              isOpen: isOpen[2],
              toggleOpen: toggleIsOpen,
            },
      ],
      {
        title: 'Summary',
        renderContent: () => (
          <Summary
            depositAmount={depositAmount}
            borrowAmount={borrowAmount}
            positionValue={positionValue}
            vault={props.vault}
            onClickBtn={() => {
              // TODO: Implement tx execution
            }}
          />
        ),
        renderSubTitle: () => null,
        isOpen: isOpen[3],
        toggleOpen: toggleIsOpen,
      },
    ]
  }, [
    collateralAsset,
    borrowAsset,
    isOpen,
    toggleIsOpen,
    hlsAccounts,
    depositAmount,
    setDepositAmount,
    walletCollateralAsset?.amount,
    selectedAccount,
    borrowAmount,
    positionValue,
    props.vault,
  ])

  return <Accordion items={items} />
}
