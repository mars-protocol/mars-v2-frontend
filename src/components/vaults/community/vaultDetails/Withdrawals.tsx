import DisplayCurrency from 'components/common/DisplayCurrency'
import Table from 'components/common/Table'
import VaultStats from 'components/vaults/community/vaultDetails/common/VaultStats'
import useUserWithdrawals from 'components/vaults/community/vaultDetails/table/useUserWithdrawals'
import useQueuedWithdrawals from 'components/vaults/community/vaultDetails/table/useQueuedWithdrawals'
import classNames from 'classnames'
import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import { queuedWithdrawDummyData } from 'components/vaults/dummyData'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'
import { FormattedNumber } from 'components/common/FormattedNumber'
import useStore from 'store'

export default function Withdrawals() {
  const queuedWithdrawalcolumns = useQueuedWithdrawals({ isLoading: false })
  const withdrawalColumns = useUserWithdrawals({ isLoading: false })
  const address = useStore((s) => s.address)

  if (!address) {
    return (
      <Table
        title='Withdrawals'
        columns={withdrawalColumns}
        data={queuedWithdrawDummyData}
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
            // TODO: fetch from contract
            {
              description: 'Depositor Withdrawal Period',
              value: (
                <FormattedNumber
                  amount={24}
                  options={{
                    minDecimals: 0,
                    maxDecimals: 0,
                    suffix: ' hours',
                  }}
                  animate
                />
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
                  animate
                />
              ),
            },
            {
              description: 'USDC in vault',
              value: <DisplayCurrency coin={BNCoin.fromDenomAndBigNumber('usd', BN(1000))} />,
            },
            {
              description: 'Total Withdrawal Value',
              value: <DisplayCurrency coin={BNCoin.fromDenomAndBigNumber('usd', BN(2000))} />,
            },
            {
              description: 'Accrued PnL',
              value: (
                <div className='flex items-center gap-2'>
                  <DisplayCurrency
                    coin={BNCoin.fromDenomAndBigNumber('usd', BN(202))}
                    // TODO: conditional classname text-profit / text-loss
                    className={classNames('text-profit')}
                  />
                  <span className='text-white/10'>|</span>
                  <span className='text-white/50'>Since 20.06.24</span>
                </div>
              ),
            },
            {
              description: '% of USDC vs Queued Withdrawal Value',
              value: (
                <FormattedNumber
                  amount={200}
                  options={{
                    suffix: '%',
                    minDecimals: 2,
                    maxDecimals: 2,
                  }}
                  animate
                />
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
