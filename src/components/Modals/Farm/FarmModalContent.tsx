import classNames from 'classnames'
import { useCallback, useMemo, useState } from 'react'

import AccountSummaryInModal from 'components/account/AccountSummary/AccountSummaryInModal'
import Accordion from 'components/common/Accordion'
import Text from 'components/common/Text'
import FarmBorrowings from 'components/Modals/Farm/FarmBorrowings'
import FarmBorrowingsSubTitle from 'components/Modals/Farm/FarmBorrowingsSubTitle'
import FarmDeposits from 'components/Modals/Farm/FarmDeposits'
import FarmDepositsSubTitle from 'components/Modals/Farm/FarmDepositsSubTitle'
import FarmLeverage from 'components/Modals/Hls/Deposit/FarmLeverage'
import { EMPTY_ACCOUNT_HLS } from 'constants/accounts'
import { BN_ZERO } from 'constants/math'
import useAccounts from 'hooks/accounts/useAccounts'
import useDisplayAsset from 'hooks/assets/useDisplayAsset'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useIsOpenArray from 'hooks/common/useIsOpenArray'
import useDisplayCurrency from 'hooks/localStorage/useDisplayCurrency'
import useSlippage from 'hooks/settings/useSlippage'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { isAccountEmpty } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { getAstroLpBaseDepositCoinsAndValue, getAstroLpSharesFromCoinsValue } from 'utils/astroLps'
import { getCoinValue, magnify } from 'utils/formatters'
import { getCapLeftWithBuffer } from 'utils/generic'
import { getVaultBaseDepositCoinsAndValue } from 'utils/vaults'
import CreateAccount from '../Hls/Deposit/CreateAccount'
import SelectAccount from '../Hls/Deposit/SelectAccount'
import { SelectAccountSubTitle } from '../Hls/Deposit/SubTitles'
import HlsFarmingSummary from '../Hls/Deposit/Summary/HlsFarmingSummary'

interface Props {
  farm: Vault | DepositedVault | AstroLp | DepositedAstroLp
  account: Account
  isAstroLp: boolean
  isDeposited?: boolean
  removedDeposits: BNCoin[]
  addedDebts: BNCoin[]
  removedLends: BNCoin[]
  simulateAstroLpDeposit?: (lp: string, deposits: BNCoin[], borrowings: BNCoin[]) => void
  simulateVaultDeposit?: (address: string, deposits: BNCoin[], borrowings: BNCoin[]) => void
  type: FarmModal['type']
}

export default function FarmModalContent(props: Props) {
  const {
    farm,
    account,
    isAstroLp,
    isDeposited,
    removedDeposits,
    addedDebts,
    removedLends,
    simulateAstroLpDeposit,
    simulateVaultDeposit,
    type,
  } = props
  const address = useStore((s) => s.address)
  const assets = useWhitelistedAssets()
  const [displayCurrency] = useDisplayCurrency()
  const [isOpen, toggleOpen] = useIsOpenArray(type === 'high_leverage' ? 4 : 2, false)
  const [isCustomRatio, setIsCustomRatio] = useState(false)
  const [depositCoins, setDepositCoins] = useState<BNCoin[]>([])
  const [borrowCoins, setBorrowCoins] = useState<BNCoin[]>([])
  const displayAsset = useDisplayAsset()
  const [slippage] = useSlippage()
  const { data: hlsAccounts } = useAccounts('high_levered_strategy', address)
  const [selectedAccount, setSelectedAccount] = useState<Account>(EMPTY_ACCOUNT_HLS)

  const { totalValue } = useMemo(() => {
    if (isAstroLp && type === 'astroLp')
      return getAstroLpBaseDepositCoinsAndValue(
        farm as AstroLp,
        removedDeposits,
        addedDebts,
        removedLends,
        assets,
      )

    if (isAstroLp && type === 'high_leverage')
      return getAstroLpBaseDepositCoinsAndValue(
        farm as AstroLp,
        depositCoins,
        borrowCoins,
        [],
        assets,
      )

    return getVaultBaseDepositCoinsAndValue(
      farm as Vault,
      removedDeposits,
      addedDebts,
      removedLends,
      slippage,
      assets,
    )
  }, [
    addedDebts,
    assets,
    borrowCoins,
    depositCoins,
    farm,
    isAstroLp,
    removedDeposits,
    removedLends,
    slippage,
    type,
  ])

  const primaryAsset = useMemo(
    () => assets.find(byDenom(farm.denoms.primary)),
    [assets, farm.denoms.primary],
  )
  const secondaryAsset = useMemo(
    () => assets.find(byDenom(farm.denoms.secondary)),
    [assets, farm.denoms.secondary],
  )
  const depositCapReachedCoins = useMemo(() => {
    if (!farm.cap) return [BNCoin.fromDenomAndBigNumber(displayAsset.denom, BN_ZERO)]

    const capLeft = getCapLeftWithBuffer(farm.cap)
    const totalShares = getAstroLpSharesFromCoinsValue(farm as AstroLp, totalValue, assets)

    if (isAstroLp && totalShares.isGreaterThan(capLeft)) {
      const amount = magnify(
        getCoinValue(BNCoin.fromDenomAndBigNumber(farm.cap.denom, capLeft), assets).toString(),
        displayAsset,
      )

      return [BNCoin.fromDenomAndBigNumber(displayAsset.denom, amount)]
    }

    if (!isAstroLp && totalValue.isGreaterThan(capLeft)) {
      const amount = magnify(
        getCoinValue(BNCoin.fromDenomAndBigNumber(farm.cap.denom, capLeft), assets).toString(),
        displayAsset,
      )

      return [BNCoin.fromDenomAndBigNumber(displayAsset.denom, amount)]
    }

    return []
  }, [farm, displayAsset, totalValue, assets, isAstroLp])

  const onChangeIsCustomRatio = useCallback(
    (isCustomRatio: boolean) => setIsCustomRatio(isCustomRatio),
    [setIsCustomRatio],
  )

  const onChangeDeposits = useCallback(
    (coins: BNCoin[]) => {
      setDepositCoins(coins)
      if (isAstroLp && simulateAstroLpDeposit)
        simulateAstroLpDeposit(farm.denoms.lp, coins, borrowCoins)
      if (!isAstroLp && simulateVaultDeposit) simulateVaultDeposit(farm.address, coins, borrowCoins)
    },
    [
      borrowCoins,
      farm.address,
      farm.denoms.lp,
      isAstroLp,
      simulateAstroLpDeposit,
      simulateVaultDeposit,
    ],
  )

  const onChangeBorrowings = useCallback(
    (coins: BNCoin[]) => {
      setBorrowCoins(coins)
      if (isAstroLp && simulateAstroLpDeposit)
        simulateAstroLpDeposit(farm.denoms.lp, depositCoins, coins)
      if (!isAstroLp && simulateVaultDeposit) simulateVaultDeposit(farm.address, coins, borrowCoins)
    },
    [
      borrowCoins,
      depositCoins,
      farm.address,
      farm.denoms.lp,
      isAstroLp,
      simulateAstroLpDeposit,
      simulateVaultDeposit,
    ],
  )

  const emptyHlsAccounts = useMemo(() => {
    const emptyAccounts = hlsAccounts.filter((account) => isAccountEmpty(account))

    if (emptyAccounts.length > 0 && selectedAccount.id === 'default') {
      setSelectedAccount(emptyAccounts[0])
    }

    return emptyAccounts
  }, [hlsAccounts, selectedAccount])

  const getDepositSubTitle = useCallback(() => {
    if (isOpen[0] && isDeposited)
      return (
        <Text size='xs' className='mt-1 text-white/60'>
          The amounts you enter below will be added to your current position.
        </Text>
      )

    if (isOpen[0]) return null
    if (!primaryAsset || !secondaryAsset) return null
    return (
      <FarmDepositsSubTitle
        primaryAmount={
          depositCoins.find((coin) => coin.denom === primaryAsset.denom)?.amount || BN_ZERO
        }
        secondaryAmount={
          depositCoins.find((coin) => coin.denom === secondaryAsset.denom)?.amount || BN_ZERO
        }
        primaryAsset={primaryAsset}
        secondaryAsset={secondaryAsset}
        displayCurrency={displayCurrency}
      />
    )
  }, [depositCoins, displayCurrency, isDeposited, isOpen, primaryAsset, secondaryAsset])

  const getBorrowingsSubTitle = useCallback(() => {
    if (isOpen[1] && isDeposited)
      return (
        <Text size='xs' className='mt-1 text-white/60'>
          The amounts you enter below will be added to your current position.
        </Text>
      )

    if (isOpen[1]) return null

    return <FarmBorrowingsSubTitle borrowings={addedDebts} displayCurrency={displayCurrency} />
  }, [addedDebts, displayCurrency, isDeposited, isOpen])

  const items = useMemo(() => {
    if (!primaryAsset || !secondaryAsset) return []
    if (type === 'high_leverage')
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
              farm={farm as AstroLp}
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
                renderSubTitle: () => (
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
            />
          ),
          title: 'Summary',
          renderSubTitle: () => null,
          isOpen: isOpen[3],
          toggleOpen: (index: number) => toggleOpen(index),
        },
      ]

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
    emptyHlsAccounts,
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
    toggleOpen,
    totalValue,
    type,
  ])

  return (
    <div
      className={classNames(
        'flex items-start flex-1 p-2 gap-4 flex-wrap',
        'md:p-4 md:gap-6',
        'lg:flex-nowrap lg:p-6',
      )}
    >
      <Accordion className='h-[546px] overflow-y-scroll scrollbar-hide flex-1' items={items} />
      <AccountSummaryInModal account={account} />
    </div>
  )
}
