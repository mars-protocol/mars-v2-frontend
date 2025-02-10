import HealthBar from 'components/account/Health/HealthBar'
import useBorrowMarketAssetsTableData from 'components/borrow/Table/useBorrowMarketAssetsTableData'
import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import Table from 'components/common/Table'
import Text from 'components/common/Text'
import useLendingMarketAssetsTableData from 'components/earn/lend/Table/useLendingMarketAssetsTableData'
import VaultStats from 'components/managedVaults/community/vaultDetails/common/VaultStats'
import useVaultBalances from 'components/managedVaults/community/vaultDetails/table/useVaultBalances'
import { vaultBalanceData } from 'components/managedVaults/dummyData'
import { ORACLE_DENOM } from 'constants/oracle'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAssets from 'hooks/assets/useAssets'
import useAstroLpAprs from 'hooks/astroLp/useAstroLpAprs'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useAssetParams from 'hooks/params/useAssetParams'
import usePerpsMarketStates from 'hooks/perps/usePerpsMarketStates'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useVaultAprs from 'hooks/vaults/useVaultAprs'
import { useMemo } from 'react'
import { BNCoin } from 'types/classes/BNCoin'
import { getAccountSummaryStats } from 'utils/accounts'
import { BN } from 'utils/helpers'

export default function VaultSummary() {
  const columns = useVaultBalances()

  const account = useCurrentAccount()
  const { data: vaultAprs } = useVaultAprs()
  const astroLpAprs = useAstroLpAprs()
  const { data: assets } = useAssets()
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
  const assetParams = useAssetParams()

  const { health, healthFactor } = useHealthComputer(account)

  const { positionValue, debts, netWorth, apy, leverage } = useMemo(() => {
    return getAccountSummaryStats(
      account as Account,
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
    account,
    borrowAssetsData,
    lendingAssetsData,
    assets,
    vaultAprs,
    astroLpAprs,
    assetParams.data,
    perpsVault?.apy,
    perpsMarketStates.data,
  ])

  const tabs: CardTab[] = [
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
      renderContent: () => (
        <Table
          title='Balances'
          hideCard
          columns={columns}
          data={vaultBalanceData}
          initialSorting={[]}
          tableBodyClassName='bg-white/5'
          spacingClassName='p-3'
          type='balances'
        />
      ),
    },
  ]
  return <CardWithTabs tabs={tabs} />
}
