import classNames from 'classnames'
import DisplayCurrency from 'components/common/DisplayCurrency'
import moment from 'moment'
import Table from 'components/common/Table'
import useQueuedWithdrawals from 'components/vaults/community/vaultDetails/table/useQueuedWithdrawals'
import useUserWithdrawals from 'components/vaults/community/vaultDetails/table/useUserWithdrawals'
import useVaultAssets from 'hooks/assets/useVaultAssets'
import VaultStats from 'components/vaults/community/vaultDetails/common/VaultStats'
import { BN } from 'utils/helpers'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import { ExclamationMarkTriangle } from 'components/common/Icons'
import { formatLockupPeriod } from 'utils/formatters'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { queuedWithdrawDummyData, withdrawalsDummyData } from 'components/vaults/dummyData'
import { Tooltip } from 'components/common/Tooltip'

interface Props {
  details: ExtendedManagedVaultDetails
  isOwner?: boolean
}

export default function Withdrawals(props: Props) {
  const { details, isOwner } = props
  const queuedWithdrawalcolumns = useQueuedWithdrawals({ isLoading: false })
  const userWithdrawalColumns = useUserWithdrawals({ isLoading: false })
  const vaultAssets = useVaultAssets()

  const depositAsset = vaultAssets.find(byDenom(details.base_token)) as Asset

  if (!isOwner) {
    return (
      <Table
        title='Withdrawals'
        columns={userWithdrawalColumns}
        data={withdrawalsDummyData}
        initialSorting={[]}
        tableBodyClassName='bg-white/5'
        spacingClassName='p-3'
      />
    )
  }

  const tabs: CardTab[] = [
    {
      title: 'Withdrawal Summary',
      renderContent: () => (
        <VaultStats
          stats={[
            {
              description: 'Depositor Withdrawal Period',
              value: formatLockupPeriod(
                moment.duration(details.cooldown_period, 'seconds').as('days'),
                'days',
              ),
            },
            {
              description: 'Queued Withdrawals',
              value: (
                <FormattedNumber
                  amount={3}
                  options={{
                    minDecimals: 0,
                    maxDecimals: 0,
                  }}
                />
              ),
            },
            {
              description: `${depositAsset.symbol} in vault`,
              value: (
                <DisplayCurrency
                  coin={BNCoin.fromDenomAndBigNumber(
                    depositAsset.denom,
                    BN(details.total_base_tokens),
                  )}
                />
              ),
            },
            {
              description: 'Total Withdrawal Value',
              value: <DisplayCurrency coin={BNCoin.fromDenomAndBigNumber('usd', BN(2000))} />,
            },
            {
              description: 'Accured PnL',
              value: (
                <div className='flex items-center gap-2'>
                  <DisplayCurrency
                    coin={BNCoin.fromDenomAndBigNumber(
                      'usd',
                      BN(details.performance_fee_state.accumulated_pnl),
                    )}
                    className={classNames('text-sm text-white', {
                      'text-profit': BN(details.performance_fee_state.accumulated_pnl).isPositive(),
                      'text-loss': BN(details.performance_fee_state.accumulated_pnl).isNegative(),
                    })}
                  />
                  <span className='text-white/10'>|</span>
                  <span className='text-white/50'>Since 20.06.24</span>
                </div>
              ),
            },
            {
              description: '% of USDC vs Queued Withdrawal Value',
              value: (
                <div className='flex gap-2'>
                  {/* conditional tooltip */}
                  <Tooltip
                    content={
                      'Vault does not have enough USDC to service queued withdrawals. please free up some.  If the 1 day freeze period has ended and a user initiates a withdraw without spot USDC available in the Vault, the Vault will automatically borrow USDC to service the withdraw.'
                    }
                    type='warning'
                    contentClassName='w-60'
                  >
                    <ExclamationMarkTriangle className='w-3.5 h-3.5 text-info hover:text-primary' />
                  </Tooltip>
                  <FormattedNumber
                    amount={200}
                    options={{
                      minDecimals: 2,
                      maxDecimals: 2,
                      suffix: '%',
                    }}
                  />
                </div>
              ),
            },
          ]}
        />
      ),
    },
    {
      title: 'Queued Withdrawals',
      renderContent: () => (
        <Table
          title='Queued Summary'
          hideCard
          columns={queuedWithdrawalcolumns}
          data={queuedWithdrawDummyData}
          initialSorting={[]}
          tableBodyClassName='bg-white/5'
          spacingClassName='p-3'
        />
      ),
    },
  ]
  return <CardWithTabs tabs={tabs} />
}
