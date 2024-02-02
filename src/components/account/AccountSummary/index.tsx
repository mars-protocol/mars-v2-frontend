import { useCallback, useMemo } from 'react'

import AccountBalancesTable from 'components/account/AccountBalancesTable'
import AccountComposition from 'components/account/AccountComposition'
import AccountPerpPositionTable from 'components/account/AccountPerpPositionTable'
import AccountSummaryHeader from 'components/account/AccountSummary/AccountSummaryHeader'
import useBorrowMarketAssetsTableData from 'components/borrow/Table/useBorrowMarketAssetsTableData'
import Accordion from 'components/common/Accordion'
import useLendingMarketAssetsTableData from 'components/earn/lend/Table/useLendingMarketAssetsTableData'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { BN_ZERO } from 'constants/math'
import useAllAssets from 'hooks/assets/useAllAssets'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useHLSStakingAssets from 'hooks/useHLSStakingAssets'
import useHealthComputer from 'hooks/useHealthComputer'
import usePrices from 'hooks/usePrices'
import useStore from 'store'
import { calculateAccountApr, calculateAccountLeverage } from 'utils/accounts'

interface Props {
  account: Account
  isAccountDetails?: boolean
  isHls?: boolean
}

export default function AccountSummary(props: Props) {
  const storageKey = props.isAccountDetails
    ? LocalStorageKeys.ACCOUNT_DETAILS_TABS
    : LocalStorageKeys.ACCOUNT_SUMMARY_TABS
  const defaultSetting = props.isAccountDetails
    ? DEFAULT_SETTINGS.accountDetailsTabs
    : DEFAULT_SETTINGS.accountSummaryTabs
  const [accountSummaryTabs, setAccountSummaryTabs] = useLocalStorage<boolean[]>(
    storageKey,
    defaultSetting,
  )
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
  const { health, healthFactor } = useHealthComputer(props.account)
  const { health: updatedHealth, healthFactor: updatedHealthFactor } =
    useHealthComputer(updatedAccount)
  const leverage = useMemo(
    () => (props.account ? calculateAccountLeverage(props.account, prices, assets) : BN_ZERO),
    [props.account, prices, assets],
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
        updatedAccount ?? props.account,
        borrowAssetsData,
        lendingAssetsData,
        prices,
        hlsStrategies,
        assets,
        props.account.kind === 'high_levered_strategy',
      ),
    [
      props.account,
      assets,
      borrowAssetsData,
      hlsStrategies,
      lendingAssetsData,
      prices,
      updatedAccount,
    ],
  )

  const items = useMemo(() => {
    const itemsArray = [
      {
        title: `Composition`,
        renderContent: () =>
          props.account ? <AccountComposition account={props.account} isHls={props.isHls} /> : null,
        isOpen: accountSummaryTabs[0],
        toggleOpen: (index: number) => handleToggle(index),
        renderSubTitle: () => <></>,
      },
      {
        title: 'Balances',
        renderContent: () =>
          props.account ? (
            <AccountBalancesTable
              account={props.account}
              borrowingData={borrowAssetsData}
              lendingData={lendingAssetsData}
              hideCard
              isHls={props.isHls}
            />
          ) : null,
        isOpen: accountSummaryTabs[1],
        toggleOpen: (index: number) => handleToggle(index),
        renderSubTitle: () => <></>,
      },
    ]
    if (props.account.perps.length > 0)
      itemsArray.push({
        title: 'Perp Positions',
        renderContent: () =>
          props.account && props.account.perps.length > 0 ? (
            <AccountPerpPositionTable account={props.account} hideCard />
          ) : null,
        isOpen: accountSummaryTabs[2] ?? false,
        toggleOpen: (index: number) => handleToggle(index),
        renderSubTitle: () => <></>,
      })

    return itemsArray
  }, [
    props.account,
    borrowAssetsData,
    lendingAssetsData,
    props.isHls,
    handleToggle,
    accountSummaryTabs,
  ])

  if (!props.account) return null
  return (
    <>
      <AccountSummaryHeader
        account={props.account}
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
        isClosable={props.isAccountDetails}
      />
      <Accordion items={items} allowMultipleOpen />
    </>
  )
}
