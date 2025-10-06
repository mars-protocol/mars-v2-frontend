import AccountBalancesTable from 'components/account/AccountBalancesTable'
import AccountStrategiesTable from 'components/account/AccountStrategiesTable'
import AccountPerpPositionTable from 'components/account/AccountPerpPositionTable'
import DisplayCurrency from 'components/common/DisplayCurrency'
import HealthBar from 'components/account/Health/HealthBar'
import Text from 'components/common/Text'
import VaultStats from 'components/managedVaults/vaultDetails/common/VaultStats'
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
import { formatValue } from 'utils/formatters'
import VaultDepositorsTable from 'components/managedVaults/vaultDetails/overview/DepositorTable/VaultDepositorsTable'
interface Props {
  details: ManagedVaultsData
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
          <div className='bg-white/5'>
            <VaultStats
              stats={[
                {
                  description: 'Health',
                  value: (
                    <div className='flex flex-col justify-end gap-2'>
                      <HealthBar health={health} healthFactor={healthFactor} className='h-1' />
                      <Text size='2xs' className='text-right text-white/50'>
                        Health Factor: {formatValue(healthFactor > 100 ? 100 : healthFactor)}
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
          </div>
        ),
      },
      {
        title: 'Balances',
        renderContent: () =>
          accountData ? (
            <div className='h-74 overflow-y-auto bg-white/5 scrollbar-hide'>
              <AccountBalancesTable
                account={accountData}
                borrowingData={borrowAssetsData}
                lendingData={lendingAssetsData}
                hideCard
                abbreviated={false}
              />
            </div>
          ) : null,
        notificationCount:
          (accountData?.debts.length || 0) +
          (accountData?.lends.length || 0) +
          (accountData?.deposits.length || 0),
      },
    ]

    const strategiesCount =
      (accountData?.vaults?.length || 0) +
      (accountData?.perpsVault ? 1 : 0) +
      (accountData?.stakedAstroLps?.length || 0)

    if (strategiesCount > 0 && accountData) {
      tabsArray.push({
        title: 'Strategies',
        renderContent: () => (
          <div className='h-74 overflow-y-auto bg-white/5 scrollbar-hide'>
            <AccountStrategiesTable account={accountData} hideCard />
          </div>
        ),
        notificationCount: strategiesCount,
      })
    }

    const perpsCount = accountData?.perps?.length || 0

    if (perpsCount > 0 && accountData) {
      tabsArray.push({
        title: 'Perp Positions',
        renderContent: () => (
          <div className='h-74 overflow-y-auto bg-white/5 scrollbar-hide'>
            <AccountPerpPositionTable account={accountData} hideCard />
          </div>
        ),
        notificationCount: perpsCount,
      })
    }

    if (accountData) {
      tabsArray.push({
        title: 'Depositors',
        renderContent: () => (
          <div className='h-74 overflow-y-auto bg-white/5 scrollbar-hide'>
            <VaultDepositorsTable
              vaultTokensDenom={details.vault_tokens_denom}
              vaultAddress={details.vault_address}
              baseTokensDenom={details.base_tokens_denom}
              vault_tokens_amount={details.vault_tokens_amount}
              ownerAddress={details.ownerAddress || ''}
            />
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
    details.vault_tokens_denom,
    details.vault_address,
    details.base_tokens_denom,
    details.vault_tokens_amount,
    details.ownerAddress,
  ])

  return <CardWithTabs tabs={tabs} textSizeClass='text-base' />
}
