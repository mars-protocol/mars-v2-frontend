import { useCallback, useEffect, useState } from 'react'

import Accordion from 'components/Accordion'
import AccountSummary from 'components/Account/AccountSummary'
import VaultBorrowings from 'components/Modals/Vault/VaultBorrowings'
import VaultBorrowingsSubTitle from 'components/Modals/Vault/VaultBorrowingsSubTitle'
import VaultDeposit from 'components/Modals/Vault/VaultDeposits'
import VaultDepositSubTitle from 'components/Modals/Vault/VaultDepositsSubTitle'
import { BN_ZERO } from 'constants/math'
import useDepositVault from 'hooks/broadcast/useDepositVault'
import useIsOpenArray from 'hooks/useIsOpenArray'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'

interface Props {
  vault: Vault | DepositedVault
  primaryAsset: Asset
  secondaryAsset: Asset
  account: Account
  isDeposited?: boolean
}

export default function VaultModalContent(props: Props) {
  const { addDebt, removeDeposits, addedDebt, removedDeposits, updatedAccount, addVaultValues } =
    useUpdatedAccount(props.account)

  const [isOpen, toggleOpen] = useIsOpenArray(2, false)
  const [isCustomRatio, setIsCustomRatio] = useState(false)

  const { actions: depositActions, totalValue } = useDepositVault({
    vault: props.vault,
    deposits: removedDeposits,
    borrowings: addedDebt,
  })

  useEffect(() => {
    addVaultValues([
      {
        address: props.vault.address,
        value: totalValue,
      },
    ])
  }, [totalValue, addVaultValues, props.vault.address])

  const onChangeIsCustomRatio = useCallback(
    (isCustomRatio: boolean) => setIsCustomRatio(isCustomRatio),
    [setIsCustomRatio],
  )

  function getDepositSubTitle() {
    if (isOpen[0] && props.isDeposited)
      return 'The amounts you enter below will be added to your current position.'

    if (isOpen[0]) return null

    return (
      <VaultDepositSubTitle
        primaryAmount={
          removedDeposits.find((coin) => coin.denom === props.primaryAsset.denom)?.amount || BN_ZERO
        }
        secondaryAmount={
          removedDeposits.find((coin) => coin.denom === props.secondaryAsset.denom)?.amount ||
          BN_ZERO
        }
        primaryAsset={props.primaryAsset}
        secondaryAsset={props.secondaryAsset}
      />
    )
  }

  function getBorrowingsSubTitle() {
    if (isOpen[1] && props.isDeposited)
      return 'The amounts you enter below will be added to your current position.'

    if (isOpen[1]) return null

    return <VaultBorrowingsSubTitle borrowings={addedDebt} />
  }

  return (
    <div className='flex flex-1 items-start gap-6 p-6'>
      <Accordion
        className='h-[546px] overflow-y-scroll scrollbar-hide'
        items={[
          {
            renderContent: () => (
              <VaultDeposit
                deposits={removedDeposits}
                onChangeDeposits={removeDeposits}
                primaryAsset={props.primaryAsset}
                secondaryAsset={props.secondaryAsset}
                account={props.account}
                toggleOpen={toggleOpen}
                isCustomRatio={isCustomRatio}
                onChangeIsCustomRatio={onChangeIsCustomRatio}
              />
            ),
            title: 'Deposit',
            renderSubTitle: getDepositSubTitle,
            isOpen: isOpen[0],
            toggleOpen: (index: number) => toggleOpen(index),
          },
          {
            renderContent: () => (
              <VaultBorrowings
                updatedAccount={updatedAccount || props.account}
                borrowings={addedDebt}
                deposits={removedDeposits}
                primaryAsset={props.primaryAsset}
                secondaryAsset={props.secondaryAsset}
                onChangeBorrowings={addDebt}
                vault={props.vault}
                depositActions={depositActions}
              />
            ),
            title: 'Borrow',
            renderSubTitle: getBorrowingsSubTitle,
            isOpen: isOpen[1],
            toggleOpen: (index: number) => toggleOpen(index),
          },
        ]}
      />

      <AccountSummary account={props.account} />
    </div>
  )
}
