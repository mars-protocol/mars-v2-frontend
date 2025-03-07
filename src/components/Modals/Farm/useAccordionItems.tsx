import FarmBorrowings from 'components/Modals/Farm/FarmBorrowings'
import FarmDeposits from 'components/Modals/Farm/FarmDeposits'
import FarmHedge from 'components/Modals/Farm/FarmHedge'
import CreateAccount from 'components/Modals/Hls/Deposit/CreateAccount'
import FarmLeverage from 'components/Modals/Hls/Deposit/FarmLeverage'
import SelectAccount from 'components/Modals/Hls/Deposit/SelectAccount'
import { SelectAccountSubTitle } from 'components/Modals/Hls/Deposit/SubTitles'
import HlsFarmingSummary from 'components/Modals/Hls/Deposit/Summary/HlsFarmingSummary'
import Text from 'components/common/Text'
import useAccounts from 'hooks/accounts/useAccounts'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import { ReactElement, useMemo } from 'react'
import useStore from 'store'
import { isAccountEmpty } from 'utils/accounts'

interface Props {
  account: Account
  borrowCoins: BNCoin[]
  depositCapReachedCoins: BNCoin[]
  depositCoins: BNCoin[]
  displayCurrency: string
  farm: AstroLp | DepositedAstroLp
  getDepositSubTitle: () => ReactElement | null
  getBorrowingsSubTitle: () => ReactElement | null
  isCustomRatio: boolean
  isHedgeEnabled: boolean
  setIsHedgeEnabled: (enabled: boolean) => void
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
    isHedgeEnabled,
    setIsHedgeEnabled,
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

  const assets = useWhitelistedAssets()
  const modal = useStore((s) => s.farmModal)

  const farmItems = useMemo(() => {
    if (!primaryAsset || !secondaryAsset) return null

    const items = [
      {
        title: 'Deposit',
        renderSubTitle: getDepositSubTitle,
        renderContent: () => (
          <FarmDeposits
            deposits={depositCoins}
            primaryAsset={primaryAsset}
            secondaryAsset={secondaryAsset}
            account={account}
            onChangeDeposits={onChangeDeposits}
            type={type}
            isCustomRatio={isCustomRatio}
            onChangeIsCustomRatio={onChangeIsCustomRatio}
            toggleOpen={toggleOpen}
            depositCapReachedCoins={depositCapReachedCoins}
          />
        ),
        isOpen: isOpen[0],
        toggleOpen: (index: number) => toggleOpen(index),
      },
    ]

    // Add hedge option after deposits for AstroLp
    if (type === 'astroLp') {
      items.push({
        title: 'Hedge Position',
        renderSubTitle: () =>
          isHedgeEnabled ? (
            <Text size='xs' className='text-white/60'>
              Hedging {secondaryAsset.symbol} exposure
            </Text>
          ) : null,
        renderContent: () => (
          <FarmHedge
            isHedgeEnabled={isHedgeEnabled}
            setIsHedgeEnabled={setIsHedgeEnabled}
            primaryAsset={primaryAsset}
            secondaryAsset={secondaryAsset}
            depositCoins={depositCoins}
            borrowCoins={borrowCoins}
            onChangeBorrowings={onChangeBorrowings}
            assets={assets}
            toggleOpen={toggleOpen}
          />
        ),
        isOpen: isOpen[1],
        toggleOpen: (index: number) => toggleOpen(index),
      })
    }

    // Add borrowings section if needed
    if (type === 'high_leverage' || isHedgeEnabled) {
      items.push({
        title: 'Borrowings',
        renderSubTitle: getBorrowingsSubTitle,
        renderContent: () => (
          <FarmBorrowings
            borrowings={borrowCoins}
            onChangeBorrowings={onChangeBorrowings}
            account={account}
            type={type}
            farm={farm}
            reclaims={removedLends}
            deposits={removedDeposits}
            primaryAsset={primaryAsset}
            secondaryAsset={secondaryAsset}
            depositCapReachedCoins={depositCapReachedCoins}
            displayCurrency={displayCurrency}
            totalValue={totalValue}
          />
        ),
        isOpen: isOpen[2],
        toggleOpen: (index: number) => toggleOpen(index),
      })
    }

    // Add summary section
    items.push({
      title: 'Summary',
      renderSubTitle: () => null,
      renderContent: () => (
        <HlsFarmingSummary
          borrowings={borrowCoins}
          deposits={depositCoins}
          account={account}
          astroLp={farm}
          primaryAsset={primaryAsset}
          secondaryAsset={secondaryAsset}
          totalValue={totalValue}
          depositCapReachedCoins={depositCapReachedCoins}
          isCreate={!isDeposited}
        />
      ),
      isOpen: isOpen[3],
      toggleOpen: (index: number) => toggleOpen(index),
    })

    return items
  }, [
    primaryAsset,
    secondaryAsset,
    depositCoins,
    account,
    onChangeDeposits,
    type,
    isCustomRatio,
    onChangeIsCustomRatio,
    isHedgeEnabled,
    setIsHedgeEnabled,
    borrowCoins,
    onChangeBorrowings,
    assets,
    toggleOpen,
    getBorrowingsSubTitle,
    farm,
    totalValue,
    depositCapReachedCoins,
    isDeposited,
    getDepositSubTitle,
    removedLends,
    removedDeposits,
    displayCurrency,
    isOpen,
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
