import BigNumber from 'bignumber.js'
import { useCallback, useState } from 'react'

import Accordion from 'components/Accordion'
import AccountSummary from 'components/Account/AccountSummary'
import VaultBorrowings from 'components/modals/Vault/VaultBorrowings'
import VaultDeposit from 'components/modals/Vault/VaultDeposit'
import VaultDepositSubTitle from 'components/modals/Vault/VaultDepositSubTitle'
import useIsOpenArray from 'hooks/useIsOpenArray'
import { BN } from 'utils/helpers'
import useUpdateAccount from 'hooks/useUpdateAccount'

interface Props {
  vault: Vault
  primaryAsset: Asset
  secondaryAsset: Asset
  account: Account
}

export default function VaultModalContent(props: Props) {
  const { updatedAccount, onChangeBorrowings, borrowings } = useUpdateAccount(
    props.account,
    props.vault,
  )
  const [isOpen, toggleOpen] = useIsOpenArray(2, false)
  const [primaryAmount, setPrimaryAmount] = useState<BigNumber>(BN(0))
  const [secondaryAmount, setSecondaryAmount] = useState<BigNumber>(BN(0))
  const [isCustomRatio, setIsCustomRatio] = useState(false)

  const onChangePrimaryAmount = useCallback(
    (amount: BigNumber) => setPrimaryAmount(amount),
    [setPrimaryAmount],
  )
  const onChangeSecondaryAmount = useCallback(
    (amount: BigNumber) => setSecondaryAmount(amount),
    [setSecondaryAmount],
  )

  const onChangeIsCustomRatio = useCallback(
    (isCustomRatio: boolean) => setIsCustomRatio(isCustomRatio),
    [setIsCustomRatio],
  )

  return (
    <div className='flex flex-grow items-start gap-6 p-6'>
      <Accordion
        className='h-[546px] overflow-y-scroll scrollbar-hide'
        items={[
          {
            renderContent: () => (
              <VaultDeposit
                primaryAmount={primaryAmount}
                secondaryAmount={secondaryAmount}
                onChangePrimaryAmount={onChangePrimaryAmount}
                onChangeSecondaryAmount={onChangeSecondaryAmount}
                primaryAsset={props.primaryAsset}
                secondaryAsset={props.secondaryAsset}
                account={props.account}
                toggleOpen={toggleOpen}
                isCustomRatio={isCustomRatio}
                onChangeIsCustomRatio={onChangeIsCustomRatio}
              />
            ),
            title: 'Deposit',
            subTitle: (
              <VaultDepositSubTitle
                primaryAmount={primaryAmount}
                secondaryAmount={secondaryAmount}
                primaryAsset={props.primaryAsset}
                secondaryAsset={props.secondaryAsset}
              />
            ),
            isOpen: isOpen[0],
            toggleOpen: (index: number) => toggleOpen(index),
          },
          {
            renderContent: () => (
              <VaultBorrowings
                account={updatedAccount}
                borrowings={borrowings}
                onChangeBorrowings={onChangeBorrowings}
              />
            ),
            title: 'Borrow',
            isOpen: isOpen[1],
            toggleOpen: (index: number) => toggleOpen(index),
          },
        ]}
      />

      <AccountSummary account={props.account} />
    </div>
  )
}
