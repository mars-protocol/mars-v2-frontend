import AmountAndValue from 'components/common/AmountAndValue'
import classNames from 'classnames'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Loading from 'components/common/Loading'
import moment from 'moment'
import Table from 'components/common/Table'
import Text from 'components/common/Text'
import useQueuedWithdrawals from 'components/managedVaults/community/vaultDetails/table/useQueuedWithdrawals'
import useUserWithdrawals from 'components/managedVaults/community/vaultDetails/table/useUserWithdrawals'
import useVaultAssets from 'hooks/assets/useVaultAssets'
import VaultStats from 'components/managedVaults/community/vaultDetails/common/VaultStats'
import WithdrawButton from 'components/managedVaults/community/vaultDetails/table/columns/WithdrawButton'
import { BN } from 'utils/helpers'
import { BNCoin } from 'types/classes/BNCoin'
import { BN_ZERO } from 'constants/math'
import { byDenom } from 'utils/array'
import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import { ExclamationMarkTriangle } from 'components/common/Icons'
import { formatLockupPeriod } from 'utils/formatters'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { Tooltip } from 'components/common/Tooltip'
import { useAllUnlocks } from 'hooks/managedVaults/useAllUnlocks'
import { useUserUnlocks } from 'hooks/managedVaults/useUserUnlocks'
import { useMemo } from 'react'
import TablePagination from 'components/common/Table/TablePagination'

interface Props {
  details: ExtendedManagedVaultDetails
  isOwner?: boolean
  vaultAddress: string
}

export default function Withdrawals(props: Props) {
  const { details, isOwner, vaultAddress } = props

  const {
    data: unlocksData,
    allData: allUnlocksData,
    currentPage,
    totalPages,
    totalCount,
    isLoading: isLoadingAllUnlocks,
    handlePageChange,
  } = useAllUnlocks(vaultAddress)
  const { data: userUnlocksData = [] } = useUserUnlocks(vaultAddress)

  const unlockedPositions = useMemo(() => {
    return userUnlocksData.filter((unlock) => {
      return unlock.cooldown_end * 1000 <= Date.now()
    })
  }, [userUnlocksData])

  const totalUnlockedAmount = useMemo(() => {
    return unlockedPositions.reduce((total, unlock) => {
      return total.plus(BN(unlock.vault_tokens_amount))
    }, BN_ZERO)
  }, [unlockedPositions])

  const vaultAssets = useVaultAssets()
  const depositAsset = vaultAssets.find(byDenom(details.base_tokens_denom)) as Asset
  const withdrawalDate = moment(details.performance_fee_state.last_withdrawal * 1000)
  const isValidWithdrawal = withdrawalDate.isValid()
  const userWithdrawalColumns = useUserWithdrawals({
    isLoading: false,
    details,
    depositAsset,
  })
  const queuedWithdrawalcolumns = useQueuedWithdrawals({ isLoading: false, details, depositAsset })

  // TODO: temporary UI for freeze period in minutes, will be updated
  const lockUpPeriod =
    moment.duration(details.cooldown_period, 'seconds').as('days') < 1
      ? formatLockupPeriod(
          moment.duration(details.cooldown_period, 'seconds').as('minutes'),
          'minutes',
        )
      : formatLockupPeriod(moment.duration(details.cooldown_period, 'seconds').as('days'), 'days')

  const totalQueuedWithdrawals = allUnlocksData.reduce(
    (sum, unlock) => sum.plus(BN(unlock.base_tokens_amount)),
    BN_ZERO,
  )
  const percentage = totalQueuedWithdrawals.isZero()
    ? BN_ZERO
    : totalQueuedWithdrawals.dividedBy(BN(details.base_tokens_amount)).multipliedBy(100)

  if (!isOwner) {
    return (
      <div className='w-full max-h-75'>
        <Table
          title={
            <div className='flex justify-between items-center w-full py-3 px-4 bg-white/10'>
              <Text size='lg'>Withdrawals</Text>
              <WithdrawButton
                amount={totalUnlockedAmount.toString()}
                vaultAddress={vaultAddress}
                vaultTokenDenom={details.vault_tokens_denom}
                disabled={unlockedPositions.length === 0}
              />
            </div>
          }
          columns={userWithdrawalColumns}
          data={userUnlocksData}
          initialSorting={[{ id: 'initiated', desc: true }]}
          tableBodyClassName='bg-white/5'
          spacingClassName='p-3'
          titleComponent={
            userUnlocksData.length === 0 ? (
              <div className='h-50 flex items-center justify-center'>
                <Text size='sm' className='text-white/50'>
                  You have no pending withdrawals.
                </Text>
              </div>
            ) : undefined
          }
        />
      </div>
    )
  }

  const tabs: CardTab[] = [
    {
      title: 'Withdrawal Summary',
      renderContent: () => (
        <div className='h-64 bg-white/5'>
          <VaultStats
            stats={[
              {
                description: 'Depositor Withdrawal Period',
                value: lockUpPeriod,
              },
              {
                description: 'Queued Withdrawals',
                value: (
                  <FormattedNumber
                    amount={totalCount}
                    options={{
                      minDecimals: 0,
                      maxDecimals: 0,
                    }}
                  />
                ),
              },
              {
                description: 'Total Withdrawal Value',
                value: (
                  <AmountAndValue
                    asset={depositAsset}
                    amount={totalQueuedWithdrawals}
                    layout='horizontal'
                    abbreviated={false}
                  />
                ),
              },
              {
                description: `${depositAsset.symbol} in vault`,
                value: (
                  <AmountAndValue
                    asset={depositAsset}
                    amount={BN(details.base_tokens_amount)}
                    layout='horizontal'
                    abbreviated={false}
                  />
                ),
              },
              {
                description: 'Accrued PnL',
                value: (
                  <div className='flex items-center gap-2'>
                    <DisplayCurrency
                      coin={BNCoin.fromDenomAndBigNumber(
                        details.base_tokens_denom,
                        BN(details.performance_fee_state.accumulated_pnl),
                      )}
                      showSignPrefix
                      className={classNames(
                        'text-sm',
                        BN(details.performance_fee_state.accumulated_pnl).isGreaterThan(0) &&
                          'text-profit',
                        BN(details.performance_fee_state.accumulated_pnl).isLessThan(0) &&
                          'text-loss',
                      )}
                    />
                    {isValidWithdrawal && (
                      <>
                        <span className="text-white/50 before:content-['|'] before:mr-1.5 before:text-white/10">
                          Since {withdrawalDate.format('DD.MM.YY')}
                        </span>
                      </>
                    )}
                  </div>
                ),
              },
              {
                description: `Queued Withdrawals vs ${depositAsset.symbol} in Vault`,
                value: (() => {
                  return (
                    <div className='flex gap-2'>
                      {percentage.isGreaterThan(100) && (
                        <Tooltip
                          content={`Queued withdrawals exceed the available ${depositAsset.symbol} in the vault. If the ${lockUpPeriod} freeze period has ended and a user initiates a withdraw without spot ${depositAsset.symbol} available in the Vault, the Vault will automatically borrow ${depositAsset.symbol} to service the withdraw.`}
                          type='warning'
                          contentClassName='w-60'
                        >
                          <ExclamationMarkTriangle className='w-3.5 h-3.5 text-info hover:text-primary' />
                        </Tooltip>
                      )}
                      <FormattedNumber
                        amount={Number(percentage) || 0}
                        options={{
                          minDecimals: 2,
                          maxDecimals: 2,
                          suffix: '%',
                        }}
                      />
                    </div>
                  )
                })(),
              },
            ]}
          />
        </div>
      ),
    },
    {
      title: 'Queued Withdrawals',
      renderContent: () => (
        <div className='flex flex-col h-64 bg-white/5'>
          {isLoadingAllUnlocks ? (
            <div className='flex flex-col justify-evenly h-full px-3'>
              <Loading count={5} className='h-6 w-full' />
            </div>
          ) : totalCount > 0 ? (
            <>
              <div className='flex-1 overflow-auto scrollbar-hide'>
                <Table
                  title='Queued Withdrawals'
                  hideCard
                  columns={queuedWithdrawalcolumns}
                  data={unlocksData}
                  initialSorting={[]}
                  spacingClassName='p-3'
                />
              </div>
              <TablePagination
                currentPage={currentPage || 1}
                totalPages={totalPages || 1}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className='flex justify-center items-center h-full'>
              <Text size='sm' className='text-white/50'>
                No queued withdrawals.
              </Text>
            </div>
          )}
        </div>
      ),
    },
    ...(userUnlocksData.length > 0
      ? [
          {
            title: 'My Withdrawals',
            renderContent: () => (
              <div className='flex flex-col h-64 bg-white/5'>
                <div className='flex-1 overflow-auto scrollbar-hide'>
                  <Table
                    title='My Withdrawals'
                    hideCard
                    columns={userWithdrawalColumns}
                    data={userUnlocksData}
                    initialSorting={[{ id: 'initiated', desc: true }]}
                    spacingClassName='p-3'
                  />
                </div>
                <div className='w-full py-2 px-4 bg-black/15 border-t border-white/10'>
                  <WithdrawButton
                    amount={totalUnlockedAmount.toString()}
                    vaultAddress={vaultAddress}
                    vaultTokenDenom={details.vault_tokens_denom}
                    disabled={unlockedPositions.length === 0}
                  />
                </div>
              </div>
            ),
          },
        ]
      : []),
  ]
  return <CardWithTabs tabs={tabs} textSizeClass='text-base' />
}
