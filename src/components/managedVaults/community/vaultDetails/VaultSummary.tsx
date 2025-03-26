import AccountBalancesTable from 'components/account/AccountBalancesTable'
import AccountStrategiesTable from 'components/account/AccountStrategiesTable'
import AccountPerpPositionTable from 'components/account/AccountPerpPositionTable'
import DisplayCurrency from 'components/common/DisplayCurrency'
import HealthBar from 'components/account/Health/HealthBar'
import Text from 'components/common/Text'
import VaultStats from 'components/managedVaults/community/vaultDetails/common/VaultStats'
import useBorrowMarketAssetsTableData from 'components/borrow/Table/useBorrowMarketAssetsTableData'
import useLendingMarketAssetsTableData from 'components/earn/lend/Table/useLendingMarketAssetsTableData'
import useAccount from 'hooks/accounts/useAccount'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import { BN } from 'utils/helpers'
import { BNCoin } from 'types/classes/BNCoin'
import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { ORACLE_DENOM } from 'constants/oracle'
import { useMemo } from 'react'
import { useAccountSummaryStats } from 'hooks/accounts/useAccountSummaryStats'

interface Props {
  details: ExtendedManagedVaultDetails
}

export default function VaultSummary(props: Props) {
  const { details } = props

  const { data: accountData } = useAccount(details.vault_account_id || undefined)
  const { health, healthFactor } = useHealthComputer(accountData)
  const borrowData = useBorrowMarketAssetsTableData()
  const borrowAssetsData = useMemo(() => borrowData?.allAssets || [], [borrowData])
  const { availableAssets: lendingAvailableAssets, accountLentAssets } =
    useLendingMarketAssetsTableData()
  const lendingAssetsData = useMemo(
    () => [...lendingAvailableAssets, ...accountLentAssets],
    [lendingAvailableAssets, accountLentAssets],
  )

  const { positionValue, debts, netWorth, apy, leverage } = useAccountSummaryStats(accountData)

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
                description: "Current Positions' APY",
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
            <div className='h-64 overflow-y-auto bg-white/5 scrollbar-hide'>
              <AccountBalancesTable
                account={accountData}
                borrowingData={borrowAssetsData}
                lendingData={lendingAssetsData}
                hideCard
              />
            </div>
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
          <div className='h-64 overflow-y-auto bg-white/5 scrollbar-hide'>
            <AccountStrategiesTable account={accountData} hideCard />
          </div>
        ),
      })
    }

    const hasPerps = accountData && accountData.perps && accountData.perps.length > 0

    if (hasPerps) {
      tabsArray.push({
        title: 'Perp Positions',
        renderContent: () => (
          <div className='h-64 overflow-y-auto bg-white/5 scrollbar-hide'>
            <AccountPerpPositionTable account={accountData} hideCard />
          </div>
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
