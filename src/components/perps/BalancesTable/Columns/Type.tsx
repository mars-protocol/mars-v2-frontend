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
        <div className='flex gap-1 mt-1 items-center justify-center'>
          {hasStopLoss && <span className='bg-gray-700 text-white text-xs px-1 rounded'>SL</span>}
          {hasTakeProfit && <span className='bg-gray-700 text-white text-xs px-1 rounded'>TP</span>}
        </div>
      )}
    </div>
  )
}
