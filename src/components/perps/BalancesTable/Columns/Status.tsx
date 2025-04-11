import Text from 'components/common/Text'

export const STATUS_META = {
  accessorKey: 'type',
  header: 'Status',
  id: 'status',
  meta: { className: 'min-w-20 w-20' },
}

interface Props {
  type: string
  hasStopLoss?: boolean
  hasTakeProfit?: boolean
  showIndicators: boolean
}

export function Status({ type, hasStopLoss, hasTakeProfit, showIndicators }: Props) {
  const displayStatus = type === 'market' ? 'Open' : type

  return (
    <div className='flex flex-col items-end'>
      <Text size='xs' className='capitalize'>
        {displayStatus}
      </Text>
      {showIndicators && (hasStopLoss || hasTakeProfit) && (
        <div className='flex items-center justify-center gap-1 mt-1 '>
          {hasStopLoss && (
            <span className='px-1 text-xs rounded bg-white/10 text-white/60'>SL</span>
          )}
          {hasTakeProfit && (
            <span className='px-1 text-xs rounded bg-white/10 text-white/60'>TP</span>
          )}
        </div>
      )}
    </div>
  )
}
