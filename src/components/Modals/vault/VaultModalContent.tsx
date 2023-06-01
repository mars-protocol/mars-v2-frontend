import BigNumber from 'bignumber.js'
import { useCallback, useState } from 'react'

import Accordion from 'components/Accordion'
import AccountSummary from 'components/Account/AccountSummary'
import VaultBorrowings from 'components/Modals/vault/VaultBorrowings'
import VaultDeposit from 'components/Modals/vault/VaultDeposit'
import VaultDepositSubTitle from 'components/Modals/vault/VaultDepositSubTitle'
import useIsOpenArray from 'hooks/useIsOpenArray'
import { BN } from 'utils/helpers'

interface Props {
  vault: Vault
  primaryAsset: Asset
  secondaryAsset: Asset
  account: Account
}

export default function VaultModalContent(props: Props) {
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
            renderContent: () => <VaultBorrowings />,
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
