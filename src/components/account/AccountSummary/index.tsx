import { useCallback, useMemo } from 'react'

import AccountBalancesTable from 'components/account/AccountBalancesTable'
import AccountComposition from 'components/account/AccountComposition'
import AccountPerpPositionTable from 'components/account/AccountPerpPositionTable'
import AccountStrategiesTable from 'components/account/AccountStrategiesTable'
import AccountSummaryHeader from 'components/account/AccountSummary/AccountSummaryHeader'
import useBorrowMarketAssetsTableData from 'components/borrow/Table/useBorrowMarketAssetsTableData'
import Accordion from 'components/common/Accordion'
import useLendingMarketAssetsTableData from 'components/earn/lend/Table/useLendingMarketAssetsTableData'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { BN_ZERO } from 'constants/math'
import useAllAssets from 'hooks/assets/useAllAssets'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useHealthComputer from 'hooks/useHealthComputer'
import useHLSStakingAssets from 'hooks/useHLSStakingAssets'
import usePrices from 'hooks/usePrices'
import useVaultAprs from 'hooks/vaults/useVaultAprs'
import useStore from 'store'
import { calculateAccountApr, calculateAccountLeverage } from 'utils/accounts'

interface Props {
  account: Account
  isAccountDetails?: boolean
  isHls?: boolean
}

export default function AccountSummary(props: Props) {
  const { account, isAccountDetails, isHls } = props
  const storageKey = isAccountDetails
    ? LocalStorageKeys.ACCOUNT_DETAILS_TABS
    : LocalStorageKeys.ACCOUNT_SUMMARY_TABS
  const defaultSetting = isAccountDetails
    ? DEFAULT_SETTINGS.accountDetailsTabs
    : DEFAULT_SETTINGS.accountSummaryTabs
  const [accountSummaryTabs, setAccountSummaryTabs] = useLocalStorage<boolean[]>(
    storageKey,
    defaultSetting,
  )
  const { data: vaultAprs } = useVaultAprs()
  const { data: prices } = usePrices()
  const assets = useAllAssets()
  const updatedAccount = useStore((s) => s.updatedAccount)
  const data = useBorrowMarketAssetsTableData()
  const borrowAssetsData = useMemo(() => data?.allAssets || [], [data])
  const { availableAssets: lendingAvailableAssets, accountLentAssets } =
    useLendingMarketAssetsTableData()
  const { data: hlsStrategies } = useHLSStakingAssets()
  const lendingAssetsData = useMemo(
    () => [...lendingAvailableAssets, ...accountLentAssets],
    [lendingAvailableAssets, accountLentAssets],
  )
  const { health, healthFactor } = useHealthComputer(account)
  const { health: updatedHealth, healthFactor: updatedHealthFactor } = useHealthComputer(
    updatedAccount || account,
  )
  const leverage = useMemo(
    () => (account ? calculateAccountLeverage(account, prices, assets) : BN_ZERO),
    [account, prices, assets],
  )
  const updatedLeverage = useMemo(() => {
    if (!updatedAccount) return null
    const updatedLeverage = calculateAccountLeverage(updatedAccount, prices, assets)

    if (updatedLeverage.eq(leverage)) return null
    return updatedLeverage
  }, [updatedAccount, prices, assets, leverage])

  const handleToggle = useCallback(
    (index: number) => {
      setAccountSummaryTabs(accountSummaryTabs.map((tab, i) => (i === index ? !tab : tab)))
    },
    [accountSummaryTabs, setAccountSummaryTabs],
  )

  const apr = useMemo(
    () =>
      calculateAccountApr(
        updatedAccount ?? account,
        borrowAssetsData,
        lendingAssetsData,
        prices,
        hlsStrategies,
        assets,
        vaultAprs,
        account.kind === 'high_levered_strategy',
      ),
    [
      account,
      updatedAccount,
      borrowAssetsData,
      lendingAssetsData,
      prices,
      hlsStrategies,
      assets,
      vaultAprs,
    ],
  )

  const items = useMemo(() => {
    const itemsArray = [
      {
        title: `Composition`,
        renderContent: () =>
          account ? <AccountComposition account={account} isHls={isHls} /> : null,
        isOpen: accountSummaryTabs[0],
        toggleOpen: (index: number) => handleToggle(index),
        renderSubTitle: () => <></>,
      },
      {
        title: 'Balances',
        renderContent: () =>
          account ? (
            <AccountBalancesTable
              account={account}
              borrowingData={borrowAssetsData}
              lendingData={lendingAssetsData}
              hideCard
              isHls={isHls}
            />
          ) : null,
        isOpen: accountSummaryTabs[1],
        toggleOpen: (index: number) => handleToggle(index),
        renderSubTitle: () => <></>,
      },
    ]

    const showStrategies =
      !!account.vaults.length ||
      !!updatedAccount?.vaults.length ||
      !!account.perpsVault ||
      !!updatedAccount?.perpsVault

    if (showStrategies)
      itemsArray.push({
        title: 'Strategies',
        renderContent: () =>
          account ? <AccountStrategiesTable account={account} hideCard /> : null,
        isOpen: accountSummaryTabs[2] ?? false,
        toggleOpen: (index: number) => handleToggle(index),
        renderSubTitle: () => <></>,
      })

    if (account.perps.length > 0 || (updatedAccount && updatedAccount.perps.length > 0))
      itemsArray.push({
        title: 'Perp Positions',
        renderContent: () =>
          account ? <AccountPerpPositionTable account={account} hideCard /> : null,
        isOpen: accountSummaryTabs[showStrategies ? 3 : 2] ?? false,
        toggleOpen: (index: number) => handleToggle(index),
        renderSubTitle: () => <></>,
      })

    return itemsArray
  }, [
    account,
    borrowAssetsData,
    lendingAssetsData,
    isHls,
    handleToggle,
    accountSummaryTabs,
    updatedAccount,
  ])

  if (!account) return null
  return (
    <>
      <AccountSummaryHeader
        account={account}
        updatedAccount={updatedAccount}
        prices={prices}
        assets={assets}
        leverage={leverage.toNumber() || 1}
        updatedLeverage={updatedLeverage?.toNumber() || null}
        apr={apr.toNumber()}
        health={health}
        updatedHealth={updatedHealth}
        healthFactor={healthFactor}
        updatedHealthFactor={updatedHealthFactor}
        isAccountDetails={isAccountDetails}
      />
      <Accordion items={items} allowMultipleOpen />
    </>
  )
}
