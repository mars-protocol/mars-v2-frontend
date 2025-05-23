import { Circle } from 'components/common/Icons'
import Text from 'components/common/Text'

interface LegendEntry {
  inactive: boolean
  dataKey: string
  type: string
  color: string
  value: string
  payload: {
    stroke: string
    fill?: string
    legendType: string
    name: string
    dataKey: string
    [key: string]: any
  }
}

interface Props {
  payload: LegendEntry[]
  data?: any[]
}

export default function ChartLegend(props: Props) {
  const { payload, data = [] } = props

  const uniqueEntries = new Map()
  const filteredPayload = payload
    .filter((entry) => data.some((item) => item[entry.dataKey] != null))
    .filter((entry) => {
      if (uniqueEntries.has(entry.value)) {
        return false
      }
      uniqueEntries.set(entry.value, true)
      return true
    })

  return (
    <div className='flex justify-end gap-1 sm:gap-4 mb-3 ml-3'>
      {filteredPayload.map((entry, index) => (
        <div className='flex items-center' key={`item-${index}`}>
          <Circle className='fill-current h-2 w-2' color={entry.payload.stroke} />
          <Text size='xs' className='mx-2'>
            {entry.value}
          </Text>
        </div>
      ))}
    </div>
  )
}
