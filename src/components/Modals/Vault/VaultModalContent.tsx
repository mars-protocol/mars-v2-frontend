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
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'

interface Props {
  vault: Vault | DepositedVault
  primaryAsset: Asset
  secondaryAsset: Asset
  account: Account
  isDeposited?: boolean
}

export default function VaultModalContent(props: Props) {
  const {
    addDebts,
    removeDeposits,
    addedDebt,
    removedDeposits,
    removedLends,
    removeLends,
    updatedAccount,
    addVaultValues,
  } = useUpdatedAccount(props.account)

  const [isOpen, toggleOpen] = useIsOpenArray(2, false)
  const [isCustomRatio, setIsCustomRatio] = useState(false)
  const [selectedCoins, setSelectedCoins] = useState<BNCoin[]>([])

  const { actions: depositActions, totalValue } = useDepositVault({
    vault: props.vault,
    reclaims: removedLends,
    deposits: removedDeposits,
    borrowings: addedDebt,
  })

  const handleDepositSelect = useCallback(
    (selectedCoins: BNCoin[]) => {
      const reclaims: BNCoin[] = []
      const deposits: BNCoin[] = []

      selectedCoins.forEach((selectedCoin) => {
        const { denom, amount: selectedAmount } = selectedCoin
        const accountDepositForSelectedCoin: BigNumber =
          props.account.deposits.find(byDenom(denom))?.amount ?? BN_ZERO

        if (selectedAmount.gt(accountDepositForSelectedCoin)) {
          reclaims.push(
            BNCoin.fromDenomAndBigNumber(
              denom,
              selectedAmount.minus(accountDepositForSelectedCoin),
            ),
          )
          deposits.push(BNCoin.fromDenomAndBigNumber(denom, accountDepositForSelectedCoin))
        } else {
          deposits.push(selectedCoin)
        }
      })

      removeLends(reclaims)
      removeDeposits(deposits)
      setSelectedCoins(selectedCoins)
    },
    [props.account.deposits, removeDeposits, removeLends],
  )

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
    <div className='flex items-start flex-1 gap-6 p-6'>
      <Accordion
        className='h-[546px] overflow-y-scroll scrollbar-hide'
        items={[
          {
            renderContent: () => (
              <VaultDeposit
                deposits={selectedCoins}
                onChangeDeposits={handleDepositSelect}
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
                borrowings={addedDebt}
                deposits={removedDeposits}
                primaryAsset={props.primaryAsset}
                secondaryAsset={props.secondaryAsset}
                onChangeBorrowings={addDebts}
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
