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
import useAssets from 'hooks/assets/useAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useHLSStakingAssets from 'hooks/hls/useHLSStakingAssets'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useVaultAprs from 'hooks/vaults/useVaultAprs'
import useStore from 'store'
import { calculateAccountApr, calculateAccountLeverage } from 'utils/accounts'

interface Props {
  account: Account
  isInModal?: boolean
  isHls?: boolean
}

export default function AccountSummary(props: Props) {
  const { account, isInModal, isHls } = props
  const chainConfig = useChainConfig()
  const storageKey = isInModal
    ? `${chainConfig.id}/${LocalStorageKeys.ACCOUNT_SUMMARY_IN_MODAL_TABS_EXPANDED}`
    : `${chainConfig.id}/${LocalStorageKeys.ACCOUNT_SUMMARY_TABS_EXPANDED}`
  const defaultSetting = isInModal
    ? DEFAULT_SETTINGS.accountSummaryInModalTabsExpanded
    : DEFAULT_SETTINGS.accountSummaryTabsExpanded
  const [accountSummaryTabs, setAccountSummaryTabs] = useLocalStorage<boolean[]>(
    storageKey,
    defaultSetting,
  )
  const { data: vaultAprs } = useVaultAprs()
  const { data: assets } = useAssets()
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
    () => (account ? calculateAccountLeverage(account, assets) : BN_ZERO),
    [account, assets],
  )
  const updatedLeverage = useMemo(() => {
    if (!updatedAccount) return null
    const updatedLeverage = calculateAccountLeverage(updatedAccount, assets)

    if (updatedLeverage.eq(leverage)) return null
    return updatedLeverage
  }, [updatedAccount, assets, leverage])

  const handleToggle = useCallback(
    (index: number) => {
      setAccountSummaryTabs(
        defaultSetting.map((_, i) =>
          i === index ? (!accountSummaryTabs[i] ?? true) : (accountSummaryTabs[i] ?? false),
        ),
      )
    },
    [accountSummaryTabs, setAccountSummaryTabs],
  )

  const apr = useMemo(
    () =>
      calculateAccountApr(
        updatedAccount ?? account,
        borrowAssetsData,
        lendingAssetsData,
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

    if (
      (account.perps && account.perps.length > 0) ||
      (updatedAccount && updatedAccount.perps && updatedAccount.perps.length > 0)
    )
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
        assets={assets}
        leverage={leverage.toNumber() || 1}
        updatedLeverage={updatedLeverage?.toNumber() || null}
        apr={apr.toNumber()}
        health={health}
        updatedHealth={updatedHealth}
        healthFactor={healthFactor}
        updatedHealthFactor={updatedHealthFactor}
        isInModal={isInModal}
      />
      <Accordion items={items} allowMultipleOpen />
    </>
  )
}
