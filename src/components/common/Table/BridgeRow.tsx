import { flexRender, Row as TanstackRow } from '@tanstack/react-table'
import classNames from 'classnames'
import Button from 'components/common/Button'
import { CircularProgress } from 'components/common/CircularProgress'
import Text from 'components/common/Text'
import { LEFT_ALIGNED_ROWS } from 'constants/table'
import { useHandleBridgeCompletion } from 'hooks/bridge/useHandleBridgeCompletion'

interface BridgeRowProps<T> {
  row: TanstackRow<T>
  spacingClassName?: string
  type?: TableType
}

export function BridgeRow<T>({ row, spacingClassName, type }: BridgeRowProps<T>) {
  const { handleBridgeCompletion } = useHandleBridgeCompletion()

  return (
    <tr key={`${row.id}-row`} className={classNames('bg-black/50 relative')}>
      {row.getVisibleCells().map((cell) => (
        <td
          key={cell.id}
          className={classNames(
            LEFT_ALIGNED_ROWS.includes(cell.column.id) ? 'text-left' : 'text-right',
            spacingClassName ?? 'px-4 py-2.5',
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
