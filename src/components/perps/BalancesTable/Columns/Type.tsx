import Text from 'components/common/Text'

export const TYPE_META = {
  accessorKey: 'type',
  header: 'Type',
  id: 'type',
  meta: { className: 'min-w-20 w-20' },
}

interface Props {
  type: string
  hasStopLoss?: boolean
  hasTakeProfit?: boolean
  showIndicators: boolean
}

export function Type({ type, hasStopLoss, hasTakeProfit, showIndicators }: Props) {
  return (
    <div className='flex flex-col items-start'>
      <Text size='sm' className='capitalize'>
        {type}
      </Text>
      {showIndicators && (hasStopLoss || hasTakeProfit) && (
        <div className='flex items-center justify-center gap-1 mt-1'>
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
