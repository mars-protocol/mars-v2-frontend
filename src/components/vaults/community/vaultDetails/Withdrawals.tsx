import classNames from 'classnames'
import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { ExclamationMarkTriangle } from 'components/common/Icons'
import Table from 'components/common/Table'
import { Tooltip } from 'components/common/Tooltip'
import VaultStats from 'components/vaults/community/vaultDetails/common/VaultStats'
import useQueuedWithdrawals from 'components/vaults/community/vaultDetails/table/useQueuedWithdrawals'
import useUserWithdrawals from 'components/vaults/community/vaultDetails/table/useUserWithdrawals'
import useVaultAssets from 'hooks/assets/useVaultAssets'
import moment from 'moment'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { formatLockupPeriod } from 'utils/formatters'
import { BN } from 'utils/helpers'
import { useUserUnlocks } from 'hooks/managedVaults/useUserUnlocks'
import { useAllUnlocks } from 'hooks/managedVaults/useAllUnlocks'

interface Props {
  details: ExtendedManagedVaultDetails
  isOwner?: boolean
  vaultAddress: string
}

export default function Withdrawals(props: Props) {
  const { details, isOwner, vaultAddress } = props
  const {
    data: allUnlocksData,
    currentPage,
    totalPages,
    handlePageChange,
  } = useAllUnlocks(vaultAddress, 3)
  const { data: userUnlocksData = [], isLoading: isLoadingUnlocks } = useUserUnlocks(vaultAddress)

  const queuedWithdrawalcolumns = useQueuedWithdrawals({ isLoading: false, details })
  const userWithdrawalColumns = useUserWithdrawals({
    isLoading: false,
    details,
    vaultAddress,
  })
  const vaultAssets = useVaultAssets()
  const depositAsset = vaultAssets.find(byDenom(details.base_token)) as Asset
  const withdrawalDate = moment(details.performance_fee_state.last_withdrawal * 1000)
  const isValidWithdrawal = withdrawalDate.isValid()

  if (!isOwner) {
    return userUnlocksData.length > 0 ? (
      <div className='w-full max-h-75'>
        <Table
          title='Withdrawals'
          columns={userWithdrawalColumns}
          data={userUnlocksData}
          initialSorting={[{ id: 'initiated', desc: true }]}
          tableBodyClassName='bg-white/5'
          spacingClassName='p-3'
        />
      </div>
    ) : null
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
                    showSignPrefix
                    className={classNames(
                      'text-sm',
                      BN(details.performance_fee_state.accumulated_pnl).isGreaterThan(0) &&
                        'text-profit',
                      BN(details.performance_fee_state.accumulated_pnl).isNegative() && 'text-loss',
                    )}
                  />
                  {isValidWithdrawal && (
                    <>
                      <span className='text-white/10'>|</span>
                      <span className='text-white/50'>
                        Since {withdrawalDate.format('DD.MM.YY')}
                      </span>
                    </>
                  )}
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
    ...(allUnlocksData.length > 0
      ? [
          {
            title: 'Queued Withdrawals',
            renderContent: () => (
              <Table
                title='Queued Withdrawals'
                hideCard
                columns={queuedWithdrawalcolumns}
                data={allUnlocksData}
                initialSorting={[{ id: 'created_at', desc: true }]}
                tableBodyClassName='bg-white/5'
                spacingClassName='p-3'
                pagination={{
                  currentPage,
                  totalPages,
                  onPageChange: handlePageChange,
                }}
              />
            ),
          },
        ]
      : []),
  ]
  return <CardWithTabs tabs={tabs} />
}
