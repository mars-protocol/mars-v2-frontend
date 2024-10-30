import FarmBorrowings from 'components/Modals/Farm/FarmBorrowings'
import FarmDeposits from 'components/Modals/Farm/FarmDeposits'
import CreateAccount from 'components/Modals/Hls/Deposit/CreateAccount'
import FarmLeverage from 'components/Modals/Hls/Deposit/FarmLeverage'
import SelectAccount from 'components/Modals/Hls/Deposit/SelectAccount'
import { SelectAccountSubTitle } from 'components/Modals/Hls/Deposit/SubTitles'
import HlsFarmingSummary from 'components/Modals/Hls/Deposit/Summary/HlsFarmingSummary'
import useAccounts from 'hooks/accounts/useAccounts'
import { useMemo } from 'react'
import useStore from 'store'
import { isAccountEmpty } from 'utils/accounts'

interface Props {
  account: Account
  borrowCoins: BNCoin[]
  depositCapReachedCoins: BNCoin[]
  depositCoins: BNCoin[]
  displayCurrency: string
  farm: AstroLp | DepositedAstroLp
  getDepositSubTitle: () => JSX.Element | null
  getBorrowingsSubTitle: () => JSX.Element | null
  isCustomRatio: boolean
  isOpen: boolean[]
  onChangeBorrowings: (coins: BNCoin[]) => void
  onChangeDeposits: (coins: BNCoin[]) => void
  onChangeIsCustomRatio: (isCustomRatio: boolean) => void
  primaryAsset?: Asset
  removedDeposits: BNCoin[]
  removedLends: BNCoin[]
  secondaryAsset?: Asset
  selectedAccount: Account
  setSelectedAccount: (account: Account) => void
  toggleOpen: (index: number) => void
  totalValue: BigNumber
  type: FarmModal['type']
  isDeposited?: boolean
}

export default function useAccordionItems(props: Props) {
  const {
    account,
    borrowCoins,
    depositCapReachedCoins,
    depositCoins,
    displayCurrency,
    farm,
    getBorrowingsSubTitle,
    getDepositSubTitle,
    isCustomRatio,
    isOpen,
    onChangeBorrowings,
    onChangeDeposits,
    onChangeIsCustomRatio,
    primaryAsset,
    removedDeposits,
    removedLends,
    secondaryAsset,
    selectedAccount,
    setSelectedAccount,
    toggleOpen,
    totalValue,
    type,
    isDeposited,
  } = props

  const address = useStore((s) => s.address)
  const { data: hlsAccounts } = useAccounts('high_levered_strategy', address)
  const emptyHlsAccounts = useMemo(() => {
    const emptyAccounts = hlsAccounts.filter((account) => isAccountEmpty(account))

    if (emptyAccounts.length > 0 && selectedAccount.id === 'default') {
      setSelectedAccount(emptyAccounts[0])
    }

    return emptyAccounts
  }, [hlsAccounts, selectedAccount.id, setSelectedAccount])

  const farmItems = useMemo(() => {
    if (!primaryAsset || !secondaryAsset) return null

    return [
      {
        renderContent: () => (
          <FarmDeposits
            deposits={depositCoins}
            onChangeDeposits={onChangeDeposits}
            primaryAsset={primaryAsset}
            secondaryAsset={secondaryAsset}
            account={account}
            toggleOpen={toggleOpen}
            isCustomRatio={isCustomRatio}
            onChangeIsCustomRatio={onChangeIsCustomRatio}
            depositCapReachedCoins={depositCapReachedCoins}
            type={type}
          />
        ),
        title: 'Deposit',
        renderSubTitle: getDepositSubTitle,
        isOpen: isOpen[0],
        toggleOpen: (index: number) => toggleOpen(index),
      },
      {
        renderContent: () => (
          <FarmBorrowings
            account={account}
            borrowings={borrowCoins}
            reclaims={removedLends}
            deposits={removedDeposits}
            primaryAsset={primaryAsset}
            secondaryAsset={secondaryAsset}
            onChangeBorrowings={onChangeBorrowings}
            farm={farm}
            depositCapReachedCoins={depositCapReachedCoins}
            displayCurrency={displayCurrency}
            totalValue={totalValue}
            type={type}
          />
        ),
        title: 'Borrow',
        renderSubTitle: getBorrowingsSubTitle,
        isOpen: isOpen[1],
        toggleOpen: (index: number) => toggleOpen(index),
      },
    ]
  }, [
    account,
    borrowCoins,
    depositCapReachedCoins,
    depositCoins,
    displayCurrency,
    farm,
    getBorrowingsSubTitle,
    getDepositSubTitle,
    isCustomRatio,
    isOpen,
    onChangeBorrowings,
    onChangeDeposits,
    onChangeIsCustomRatio,
    primaryAsset,
    removedDeposits,
    removedLends,
    secondaryAsset,
    toggleOpen,
    totalValue,
    type,
  ])

  const createNewHlsFarmItems = useMemo(() => {
    if (!primaryAsset || !secondaryAsset) return null

    return [
      {
        renderContent: () => (
          <FarmDeposits
            deposits={depositCoins}
            onChangeDeposits={onChangeDeposits}
            primaryAsset={primaryAsset}
            secondaryAsset={secondaryAsset}
            account={account}
            toggleOpen={toggleOpen}
            isCustomRatio={isCustomRatio}
            onChangeIsCustomRatio={onChangeIsCustomRatio}
            depositCapReachedCoins={depositCapReachedCoins}
            type={type}
          />
        ),
        title: 'Collateral',
        renderSubTitle: getDepositSubTitle,
        isOpen: isOpen[0],
        toggleOpen: (index: number) => toggleOpen(index),
      },
      {
        renderContent: () => (
          <FarmLeverage
            account={account}
            deposits={depositCoins}
            borrowings={borrowCoins}
            primaryAsset={primaryAsset}
            secondaryAsset={secondaryAsset}
            toggleOpen={toggleOpen}
            onChangeBorrowings={onChangeBorrowings}
            depositCapReachedCoins={depositCapReachedCoins}
            displayCurrency={displayCurrency}
            totalValue={totalValue}
          />
        ),
        title: 'Leverage',
        renderSubTitle: getBorrowingsSubTitle,
        isOpen: isOpen[1],
        toggleOpen: (index: number) => toggleOpen(index),
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
                  onClickBtn={() => toggleOpen(3)}
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
              toggleOpen: (index: number) => toggleOpen(index),
            }
          : {
              title: 'Create Hls Account',
              renderContent: () => <CreateAccount />,
              renderSubTitle: () =>
                selectedAccount?.id === 'default' ? null : (
                  <SelectAccountSubTitle
                    isOpen={isOpen[2]}
                    isSummaryOpen={isOpen[3] || isOpen.every((i) => !i)}
                    selectedAccountId={selectedAccount?.id}
                    type='create'
                  />
                ),
              isOpen: isOpen[2],
              toggleOpen: (index: number) => toggleOpen(index),
            },
      ],
      {
        renderContent: () => (
          <HlsFarmingSummary
            deposits={depositCoins}
            borrowings={borrowCoins}
            account={selectedAccount}
            astroLp={farm as AstroLp}
            primaryAsset={primaryAsset}
            secondaryAsset={secondaryAsset}
            totalValue={totalValue}
            isCreate={!isDeposited}
            depositCapReachedCoins={depositCapReachedCoins}
          />
        ),
        title: 'Summary',
        renderSubTitle: () => null,
        isOpen: isOpen[3],
        toggleOpen: (index: number) => toggleOpen(index),
      },
    ]
  }, [
    account,
    borrowCoins,
    depositCapReachedCoins,
    depositCoins,
    displayCurrency,
    emptyHlsAccounts,
    farm,
    getBorrowingsSubTitle,
    getDepositSubTitle,
    isCustomRatio,
    isDeposited,
    isOpen,
    onChangeBorrowings,
    onChangeDeposits,
    onChangeIsCustomRatio,
    primaryAsset,
    secondaryAsset,
    selectedAccount,
    setSelectedAccount,
    toggleOpen,
    totalValue,
    type,
  ])

  const editHlsFarmItems = useMemo(() => {
    if (!primaryAsset || !secondaryAsset) return null

    return [
      {
        renderContent: () => (
          <FarmDeposits
            deposits={depositCoins}
            onChangeDeposits={onChangeDeposits}
            primaryAsset={primaryAsset}
            secondaryAsset={secondaryAsset}
            account={account}
            toggleOpen={toggleOpen}
            isCustomRatio={isCustomRatio}
            onChangeIsCustomRatio={onChangeIsCustomRatio}
            depositCapReachedCoins={depositCapReachedCoins}
            type={type}
          />
        ),
        title: 'Collateral',
        renderSubTitle: getDepositSubTitle,
        isOpen: isOpen[0],
        toggleOpen: (index: number) => toggleOpen(index),
      },
      {
        renderContent: () => (
          <FarmLeverage
            account={account}
            deposits={depositCoins}
            borrowings={borrowCoins}
            primaryAsset={primaryAsset}
            secondaryAsset={secondaryAsset}
            toggleOpen={toggleOpen}
            onChangeBorrowings={onChangeBorrowings}
            depositCapReachedCoins={depositCapReachedCoins}
            displayCurrency={displayCurrency}
            totalValue={totalValue}
          />
        ),
        title: 'Leverage',
        renderSubTitle: getBorrowingsSubTitle,
        isOpen: isOpen[1],
        toggleOpen: (index: number) => toggleOpen(index),
      },
      {
        renderContent: () => (
          <HlsFarmingSummary
            deposits={depositCoins}
            borrowings={borrowCoins}
            account={selectedAccount}
            astroLp={farm as AstroLp}
            primaryAsset={primaryAsset}
            secondaryAsset={secondaryAsset}
            totalValue={totalValue}
            isCreate={!isDeposited}
            depositCapReachedCoins={depositCapReachedCoins}
          />
        ),
        title: 'Summary',
        renderSubTitle: () => null,
        isOpen: isOpen[2],
        toggleOpen: (index: number) => toggleOpen(index),
      },
    ]
  }, [
    account,
    borrowCoins,
    depositCapReachedCoins,
    depositCoins,
    displayCurrency,
    farm,
    getBorrowingsSubTitle,
    getDepositSubTitle,
    isCustomRatio,
    isDeposited,
    isOpen,
    onChangeBorrowings,
    onChangeDeposits,
    onChangeIsCustomRatio,
    primaryAsset,
    secondaryAsset,
    selectedAccount,
    toggleOpen,
    totalValue,
    type,
  ])

  if (type !== 'high_leverage') return farmItems
  return isDeposited ? editHlsFarmItems : createNewHlsFarmItems
}
