import BigNumber from 'bignumber.js'
import { useCallback, useMemo, useState } from 'react'

import Accordion from 'components/Accordion'
import AccountSummary from 'components/Account/AccountSummary'
import useIsOpenArray from 'hooks/useIsOpenArray'
import { BN } from 'utils/helpers'
import useUpdateAccount from 'hooks/useUpdateAccount'
import VaultBorrowingsSubTitle from 'components/Modals/Vault/VaultBorrowingsSubTitle'
import VaultDeposit from 'components/Modals/Vault/VaultDeposits'
import VaultBorrowings from 'components/Modals/Vault/VaultBorrowings'
import VaultDepositSubTitle from 'components/Modals/Vault/VaultDepositsSubTitle'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  vault: Vault | DepositedVault
  primaryAsset: Asset
  secondaryAsset: Asset
  account: Account
  isDeposited?: boolean
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

  const deposits: BNCoin[] = useMemo(() => {
    const primaryBNCoin = new BNCoin({
      denom: props.vault.denoms.primary,
      amount: primaryAmount.toString(),
    })
    const secondaryBNCoin = new BNCoin({
      denom: props.vault.denoms.secondary,
      amount: secondaryAmount.toString(),
    })
    return [primaryBNCoin, secondaryBNCoin]
  }, [primaryAmount, secondaryAmount, props.vault.denoms.primary, props.vault.denoms.secondary])

  const onChangePrimaryAmount = useCallback(
    (amount: BigNumber) => setPrimaryAmount(amount.decimalPlaces(0)),
    [setPrimaryAmount],
  )
  const onChangeSecondaryAmount = useCallback(
    (amount: BigNumber) => setSecondaryAmount(amount.decimalPlaces(0)),
    [setSecondaryAmount],
  )

  const onChangeIsCustomRatio = useCallback(
    (isCustomRatio: boolean) => setIsCustomRatio(isCustomRatio),
    [setIsCustomRatio],
  )

  function getDepositSubTitle() {
    if (isOpen[0] && props.isDeposited)
      return 'The amounts you enter below will be added to your current position.'

    return (
      <VaultDepositSubTitle
        primaryAmount={primaryAmount}
        secondaryAmount={secondaryAmount}
        primaryAsset={props.primaryAsset}
        secondaryAsset={props.secondaryAsset}
      />
    )
  }

  function getBorrowingsSubTitle() {
    if (isOpen[1] && props.isDeposited)
      return 'The amounts you enter below will be added to your current position.'

    return <VaultBorrowingsSubTitle borrowings={borrowings} />
  }

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
            renderSubTitle: getDepositSubTitle,
            isOpen: isOpen[0],
            toggleOpen: (index: number) => toggleOpen(index),
          },
          {
            renderContent: () => (
              <VaultBorrowings
                account={updatedAccount}
                borrowings={borrowings}
                primaryAmount={primaryAmount}
                secondaryAmount={secondaryAmount}
                primaryAsset={props.primaryAsset}
                secondaryAsset={props.secondaryAsset}
                onChangeBorrowings={onChangeBorrowings}
                deposits={deposits}
                vault={props.vault}
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
