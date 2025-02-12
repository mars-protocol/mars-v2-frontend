import DisplayCurrency from 'components/common/DisplayCurrency'
import HealthBar from 'components/account/Health/HealthBar'
import Table from 'components/common/Table'
import Text from 'components/common/Text'
import VaultStats from 'components/managedVaults/community/vaultDetails/common/VaultStats'
import useBorrowMarketAssetsTableData from 'components/borrow/Table/useBorrowMarketAssetsTableData'
import useLendingMarketAssetsTableData from 'components/earn/lend/Table/useLendingMarketAssetsTableData'
import useAccount from 'hooks/accounts/useAccount'
import useAssets from 'hooks/assets/useAssets'
import useAssetParams from 'hooks/params/useAssetParams'
import useAstroLpAprs from 'hooks/astroLp/useAstroLpAprs'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import usePerpsMarketStates from 'hooks/perps/usePerpsMarketStates'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useVaultAprs from 'hooks/vaults/useVaultAprs'
import { BN } from 'utils/helpers'
import { BNCoin } from 'types/classes/BNCoin'
import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { getAccountSummaryStats } from 'utils/accounts'
import { ORACLE_DENOM } from 'constants/oracle'
import { useMemo } from 'react'
import AccountBalancesTable from 'components/account/AccountBalancesTable'
import AccountStrategiesTable from 'components/account/AccountStrategiesTable'
import AccountPerpPositionTable from 'components/account/AccountPerpPositionTable'

interface Props {
  details: ExtendedManagedVaultDetails
}

export default function VaultSummary(props: Props) {
  const { details } = props

  const { data: accountData } = useAccount(details.vault_account_id || undefined)
  const { data: vaultAprs } = useVaultAprs()
  const { data: assets } = useAssets()
  const { data: perpsVault } = usePerpsVault()
  const astroLpAprs = useAstroLpAprs()
  const assetParams = useAssetParams()
  const perpsMarketStates = usePerpsMarketStates()

  const borrowData = useBorrowMarketAssetsTableData()
  const borrowAssetsData = useMemo(() => borrowData?.allAssets || [], [borrowData])

  const { availableAssets: lendingAvailableAssets, accountLentAssets } =
    useLendingMarketAssetsTableData()
  const lendingAssetsData = useMemo(
    () => [...lendingAvailableAssets, ...accountLentAssets],
    [lendingAvailableAssets, accountLentAssets],
  )

  const { health, healthFactor } = useHealthComputer(accountData)

  const { positionValue, debts, netWorth, apy, leverage } = useMemo(() => {
    if (!accountData) {
      return {
        positionValue: { amount: BN(0) },
        debts: { amount: BN(0) },
        netWorth: { amount: BN(0) },
        apy: BN(0),
        leverage: BN(1),
      }
    }

    return getAccountSummaryStats(
      accountData,
      borrowAssetsData,
      lendingAssetsData,
      assets,
      vaultAprs,
      astroLpAprs,
      assetParams.data || [],
      perpsVault?.apy || 0,
      perpsMarketStates.data || [],
    )
  }, [
    accountData,
    borrowAssetsData,
    lendingAssetsData,
    assets,
    vaultAprs,
    astroLpAprs,
    assetParams.data,
    perpsVault?.apy,
    perpsMarketStates.data,
  ])

  const tabs = useMemo(() => {
    const tabsArray: CardTab[] = [
      {
        title: 'Summary',
        renderContent: () => (
          <VaultStats
            stats={[
              {
                description: 'Health',
                value: (
                  <div className='flex flex-col justify-end gap-2'>
                    <HealthBar health={health} healthFactor={healthFactor} className='h-1' />
                    <Text size='2xs' className='text-right text-white/50'>
                      Health Factor: {healthFactor.toFixed(2)}
                    </Text>
                  </div>
                ),
              },
              {
                description: 'Net Worth',
                value: (
                  <DisplayCurrency
                    options={{ abbreviated: false }}
                    coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, netWorth.amount)}
                  />
                ),
              },
              {
                description: 'Leverage',
                value: (
                  <FormattedNumber
                    amount={leverage?.toNumber() || 1}
                    options={{
                      maxDecimals: 2,
                      minDecimals: 2,
                      suffix: 'x',
                    }}
                  />
                ),
              },
              {
                description: 'Total Position Value',
                value: (
                  <DisplayCurrency
                    coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, BN(positionValue.amount))}
                  />
                ),
              },
              {
                description: 'Debt',
                value: (
                  <DisplayCurrency
                    coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, BN(debts.amount))}
                  />
                ),
              },
              {
                description: 'Net APY',
                value: (
                  <FormattedNumber
                    amount={Number(apy)}
                    options={{
                      suffix: '%',
                      minDecimals: 2,
                      maxDecimals: 2,
                    }}
                  />
                ),
              },
            ]}
          />
        ),
      },
      {
        title: 'Balances',
        renderContent: () =>
          accountData ? (
            <AccountBalancesTable
              account={accountData}
              borrowingData={borrowAssetsData}
              lendingData={lendingAssetsData}
              hideCard
              tableBodyClassName='bg-white/5'
            />
          ) : null,
      },
    ]

    const hasStrategies =
      accountData &&
      (accountData.vaults.length > 0 ||
        accountData.perpsVault ||
        accountData.stakedAstroLps.length > 0)

    if (hasStrategies) {
      tabsArray.push({
        title: 'Strategies',
        renderContent: () => (
          <AccountStrategiesTable account={accountData} hideCard tableBodyClassName='bg-white/5' />
        ),
      })
    }

    const hasPerps = accountData && accountData.perps && accountData.perps.length > 0

    if (hasPerps) {
      tabsArray.push({
        title: 'Perp Positions',
        renderContent: () => (
          <AccountPerpPositionTable
            account={accountData}
            hideCard
            tableBodyClassName='bg-white/5'
          />
        ),
      })
    }

    return tabsArray
  }, [
    accountData,
    apy,
    borrowAssetsData,
    debts.amount,
    health,
    healthFactor,
    lendingAssetsData,
    leverage,
    netWorth.amount,
    positionValue.amount,
  ])

  return <CardWithTabs tabs={tabs} />
}
