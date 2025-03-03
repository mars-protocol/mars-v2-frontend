import { useCallback, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import AccountBalancesTable from 'components/account/AccountBalancesTable'
import AccountComposition from 'components/account/AccountComposition'
import AccountPerpPositionTable from 'components/account/AccountPerpPositionTable'
import AccountStrategiesTable from 'components/account/AccountStrategiesTable'
import AccountSummaryHeader from 'components/account/AccountSummary/AccountSummaryHeader'
import useBorrowMarketAssetsTableData from 'components/borrow/Table/useBorrowMarketAssetsTableData'
import Accordion from 'components/common/Accordion'
import useLendingMarketAssetsTableData from 'components/earn/lend/Table/useLendingMarketAssetsTableData'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useAssets from 'hooks/assets/useAssets'
import usePerpsEnabledAssets from 'hooks/assets/usePerpsEnabledAssets'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useAstroLpAprs from 'hooks/astroLp/useAstroLpAprs'
import useChainConfig from 'hooks/chain/useChainConfig'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useAssetParams from 'hooks/params/useAssetParams'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useVaultAprs from 'hooks/vaults/useVaultAprs'
import useStore from 'store'
import { calculateAccountApy, getAccountSummaryStats } from 'utils/accounts'
import usePerpsMarketStates from 'hooks/perps/usePerpsMarketStates'

interface Props {
  account: Account
  isInModal?: boolean
}

export default function AccountSummary(props: Props) {
  const { account, isInModal } = props
  const location = useLocation()
  const isIsolatedPage = location.pathname.includes('/isolated')
  const chainConfig = useChainConfig()
  const storageKey = isInModal
    ? `${chainConfig.id}/${LocalStorageKeys.ACCOUNT_SUMMARY_IN_MODAL_TABS_EXPANDED}`
    : `${chainConfig.id}/${LocalStorageKeys.ACCOUNT_SUMMARY_TABS_EXPANDED}`
  const defaultSetting = isInModal
    ? getDefaultChainSettings(chainConfig).accountSummaryInModalTabsExpanded
    : getDefaultChainSettings(chainConfig).accountSummaryTabsExpanded
  const [accountSummaryTabs, setAccountSummaryTabs] = useLocalStorage<boolean[]>(
    storageKey,
    defaultSetting,
  )
  const { data: vaultAprs } = useVaultAprs()
  const astroLpAprs = useAstroLpAprs()
  const { data: assets } = useAssets()
  const whitelistedAssets = useWhitelistedAssets()
  const perpsAssets = usePerpsEnabledAssets()
  const updatedAccount = useStore((s) => s.updatedAccount)
  const { data: perpsVault } = usePerpsVault()
  const data = useBorrowMarketAssetsTableData()
  const borrowAssetsData = useMemo(() => data?.allAssets || [], [data])
  const { availableAssets: lendingAvailableAssets, accountLentAssets } =
    useLendingMarketAssetsTableData()
  const lendingAssetsData = useMemo(
    () => [...lendingAvailableAssets, ...accountLentAssets],
    [lendingAvailableAssets, accountLentAssets],
  )
  const perpsMarketStates = usePerpsMarketStates()
  const { health, healthFactor } = useHealthComputer(account)
  const { health: updatedHealth, healthFactor: updatedHealthFactor } = useHealthComputer(
    updatedAccount || account,
  )
  const assetParams = useAssetParams()
  const { leverage } = useMemo(
    () =>
      getAccountSummaryStats(
        updatedAccount ?? account,
        borrowAssetsData,
        lendingAssetsData,
        assets,
        vaultAprs,
        astroLpAprs,
        assetParams.data || [],
        perpsVault?.apy || 0,
        perpsMarketStates.data || [],
      ),
    [
      updatedAccount,
      account,
      borrowAssetsData,
      lendingAssetsData,
      assets,
      vaultAprs,
      astroLpAprs,
      assetParams.data,
      perpsVault?.apy,
      perpsMarketStates.data,
    ],
  )

  const updatedLeverage = useMemo(() => {
    if (!updatedAccount) return null
    const { leverage: updatedLeverage } = getAccountSummaryStats(
      updatedAccount,
      borrowAssetsData,
      lendingAssetsData,
      assets,
      vaultAprs,
      astroLpAprs,
      assetParams.data || [],
      perpsVault?.apy || 0,
      perpsMarketStates.data || [],
    )

    if (updatedLeverage.eq(leverage)) return null
    return updatedLeverage
  }, [
    updatedAccount,
    borrowAssetsData,
    lendingAssetsData,
    assets,
    vaultAprs,
    astroLpAprs,
    assetParams.data,
    perpsVault?.apy,
    leverage,
    perpsMarketStates.data,
  ])

  const handleToggle = useCallback(
    (index: number) => {
      setAccountSummaryTabs(
        defaultSetting.map((_, i) =>
          i === index ? !accountSummaryTabs[i] : accountSummaryTabs[i],
        ),
      )
    },
    [accountSummaryTabs, setAccountSummaryTabs, defaultSetting],
  )

  const apr = useMemo(
    () =>
      calculateAccountApy(
        updatedAccount ?? account,
        borrowAssetsData,
        lendingAssetsData,
        [...whitelistedAssets, ...perpsAssets],
        vaultAprs,
        astroLpAprs,
        perpsVault?.apy || 0,
        perpsMarketStates.data || [],
      ),
    [
      updatedAccount,
      account,
      borrowAssetsData,
      lendingAssetsData,
      whitelistedAssets,
      perpsAssets,
      vaultAprs,
      astroLpAprs,
      perpsVault?.apy,
      perpsMarketStates.data,
    ],
  )

  const items = useMemo(() => {
    const itemsArray = [
      {
        title: 'Composition',
        renderContent: () => (account ? <AccountComposition account={account} /> : null),
        isOpen: accountSummaryTabs[0],
        toggleOpen: (index: number) => handleToggle(index),
        renderSubTitle: () => <></>,
      },
    ]

    if (!isIsolatedPage) {
      itemsArray.push({
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
      })
    }

    const showStrategies =
      !!account.vaults.length ||
      !!updatedAccount?.vaults.length ||
      !!account.perpsVault ||
      !!updatedAccount?.perpsVault ||
      !!account.stakedAstroLps.length ||
      !!updatedAccount?.stakedAstroLps.length

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
          account ? (
            <AccountPerpPositionTable account={account} hideCard isBalancesTable={false} />
          ) : null,
        isOpen: accountSummaryTabs[showStrategies ? 3 : 2] ?? false,
        toggleOpen: (index: number) => handleToggle(index),
        renderSubTitle: () => <></>,
      })

    return itemsArray
  }, [
    account,
    borrowAssetsData,
    lendingAssetsData,
    handleToggle,
    accountSummaryTabs,
    updatedAccount,
    isIsolatedPage,
  ])

  if (!account) return null
  return (
    <>
      <AccountSummaryHeader
        account={account}
        updatedAccount={updatedAccount}
        assets={assets}
        leverage={leverage?.toNumber() || 1}
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
