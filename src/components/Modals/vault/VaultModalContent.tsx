import BigNumber from 'bignumber.js'
import { useState } from 'react'

import Accordion from 'components/Accordion'
import AccountSummary from 'components/Account/AccountSummary'
import useIsOpenArray from 'hooks/useIsOpenArray'

import VaultDeposit from './VaultDeposit'
import VaultBorrowings from './VaultBorrowings'

interface Props {
  vault: Vault
  primaryAsset: Asset
  secondaryAsset: Asset
  account: Account
}

export default function VaultModalContent(props: Props) {
  const [isOpen, toggleOpen] = useIsOpenArray(2, false)
  const [deposits, setDeposits] = useState<Map<string, BigNumber>>(new Map())

  return (
    <div className='flex flex-grow items-start gap-6 p-6'>
      <Accordion
        items={[
          {
            renderContent: () => (
              <VaultDeposit
                onChangeDeposits={(deposits) => setDeposits(deposits)}
                primaryAsset={props.primaryAsset}
                secondaryAsset={props.secondaryAsset}
                account={props.account}
                toggleOpen={toggleOpen}
              />
            ),
            title: 'Deposit',
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
