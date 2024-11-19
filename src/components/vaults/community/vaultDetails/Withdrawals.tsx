import DisplayCurrency from 'components/common/DisplayCurrency'
import Table from 'components/common/Table'
import VaultStats from 'components/vaults/community/vaultDetails/common/VaultStats'
import useUserWithdrawals from 'components/vaults/community/vaultDetails/table/useUserWithdrawals'
import useQueuedWithdrawals from 'components/vaults/community/vaultDetails/table/useQueuedWithdrawals'
import classNames from 'classnames'
import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import { queuedWithdrawDummyData, withdrawalsDummyData } from 'components/vaults/dummyData'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'
import { FormattedNumber } from 'components/common/FormattedNumber'
import useStore from 'store'
import { Tooltip } from 'components/common/Tooltip'
import { ExclamationMarkTriangle } from 'components/common/Icons'

export default function Withdrawals() {
  const queuedWithdrawalcolumns = useQueuedWithdrawals({ isLoading: false })
  const userWithdrawalColumns = useUserWithdrawals({ isLoading: false })
  const address = useStore((s) => s.address)

  if (!address) {
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
              description: 'Accured PnL',
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
                    animate
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
