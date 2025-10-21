import { ColumnDef } from '@tanstack/react-table'
import DisplayCurrency from 'components/common/DisplayCurrency'
import UnlockTime, { UNLOCK_TIME_META } from 'components/earn/farm/common/Table/Columns/UnlockTime'
import Timestamp from 'components/common/Timestamp'
import { useMemo } from 'react'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { Tooltip } from 'components/common/Tooltip'
import { InfoCircle } from 'components/common/Icons'

interface Props {
  isLoading: boolean
  details: ManagedVaultsData
  depositAsset: Asset
}

export default function useUserWithdrawals(props: Props) {
  const { isLoading, details, depositAsset } = props

  return useMemo<ColumnDef<UserManagedVaultUnlock>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'Unlock Amount',
        meta: { className: 'min-w-30' },
        header: () => (
          <div className='flex items-center gap-1'>
            <span>Unlock Amount</span>
            <Tooltip
              content='Dollar values are estimates and may change based on current vault share price when you withdraw.'
              type='info'
            >
              <InfoCircle className='w-3 h-3 text-white/50 hover:text-white/70' />
            </Tooltip>
          </div>
        ),
        cell: ({ row }) => {
          const coin = BNCoin.fromDenomAndBigNumber(
            details.base_tokens_denom,
            BN(row.original.base_tokens_amount),
          )
          return (
            <DisplayCurrency
              coin={coin}
              className='text-xs'
              options={{ abbreviated: false, minDecimals: 2, maxDecimals: 2 }}
            />
          )
        },
      },
      {
        accessorKey: 'Unlock Tokens',
        meta: { className: 'min-w-30' },
        cell: ({ row }) => {
          return (
            <FormattedNumber
              amount={Number(row.original.base_tokens_amount)}
              options={{
                decimals: depositAsset.decimals,
                maxDecimals: 2,
              }}
              className='text-xs'
            />
          )
        },
      },
      {
        header: 'Initiated',
        meta: { className: 'min-w-30' },
        cell: ({ row }) => {
          return (
            <Timestamp
              value={row.original.created_at}
              isLoading={isLoading}
              unit='seconds'
              showUtc={false}
              use24Hour={false}
            />
          )
        },
      },
      {
        ...UNLOCK_TIME_META,
        cell: ({ row }) => {
          const unlocksAtMs = row.original.cooldown_end * 1000
          return <UnlockTime unlocksAt={unlocksAtMs} />
        },
      },
    ],
    [isLoading, details.base_tokens_denom, depositAsset.decimals],
  )
}
