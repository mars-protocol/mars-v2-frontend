import { flexRender, Row as TanstackRow, Table as TanstackTable } from '@tanstack/react-table'
import classNames from 'classnames'
import Button from 'components/common/Button'
import { CircularProgress } from 'components/common/CircularProgress'
import { InfoCircle } from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import { LEFT_ALIGNED_ROWS } from 'constants/table'
import { useHandleBridgeCompletion } from 'hooks/bridge/useHandleBridgeCompletion'
import { isUsdcFeeToken } from 'utils/feeToken'
import { useFeeToken } from 'hooks/wallet/useFeeToken'

interface BridgeRowProps<T> {
  row: TanstackRow<T>
  spacingClassName?: string
  type?: TableType
}

export function BridgeRow<T>({ row, spacingClassName, type }: BridgeRowProps<T>) {
  const { handleBridgeCompletion } = useHandleBridgeCompletion()
  const { feeToken } = useFeeToken()
  const usdcAsFeeToken = isUsdcFeeToken()

  const getTooltipMessage = () => {
    if (usdcAsFeeToken) {
      return 'A small amount of USDC (0.15 USDC) will be kept in your wallet for gas fees since USDC is your current fee token. The actual deposit amount will be less than the displayed amount.'
    }

    return `A small amount of ${feeToken?.coinDenom || 'gas token'} will be kept in your wallet for transaction fees. The actual deposit amount may be less than the displayed amount.`
  }

  return (
    <tr key={`${row.id}-row`} className={classNames('bg-black/50 relative')}>
      {row.getVisibleCells().map((cell) => (
        <td
          key={cell.id}
          className={classNames(
            LEFT_ALIGNED_ROWS.includes(cell.column.id) ? 'text-left' : 'text-right',
            spacingClassName ?? 'px-3 py-4',
            type &&
              type !== 'strategies' &&
              LEFT_ALIGNED_ROWS.includes(cell.column.id) &&
              'border-l',
            cell.column.columnDef.meta?.className,
          )}
        >
          <div className='opacity-30'>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </div>
        </td>
      ))}
      <td colSpan={row.getVisibleCells().length} className='absolute inset-0'>
        <div className='absolute inset-0 flex items-center justify-center'>
          {(row.original as any)?.bridgeStatus === 'STATE_COMPLETED' ? (
            <div className='flex items-center gap-1'>
              <Button
                size='xs'
                color='secondary'
                onClick={(e) => {
                  e.stopPropagation()
                  handleBridgeCompletion(row.original as any)
                }}
              >
                Complete Transaction
              </Button>

              {/* Always show the info icon with appropriate tooltip */}
              <Tooltip type='info' content={getTooltipMessage()}>
                <InfoCircle className='w-4 h-4 text-warning/70' />
              </Tooltip>
            </div>
          ) : (
            <div className='flex items-center justify-center gap-2'>
              <CircularProgress size={10} />
              <Text className='text-white pointer-events-none text-xs'>Pending...</Text>
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}
