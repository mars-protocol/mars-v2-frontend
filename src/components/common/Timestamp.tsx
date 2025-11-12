import Loading from 'components/common/Loading'
import Text from 'components/common/Text'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import dayjs from 'utils/dayjs'

export const TIMESTAMP_META = {
  id: 'name',
  header: 'Initiated',
  meta: { className: 'min-w-30' },
}

interface Props {
  value: number | string
  isLoading?: boolean
  showUtc?: boolean
  use24Hour?: boolean
  unit?: 'seconds' | 'milliseconds' | 'nanoseconds'
}

export default function Timestamp(props: Props) {
  const { value, isLoading = false, showUtc = false, use24Hour = false, unit = 'seconds' } = props

  if (isLoading) return <Loading />
  if (!value) return <Text size='xs'>N/A</Text>

  // Convert to timestamp in seconds
  let timestampInSeconds: number
  const numValue = typeof value === 'string' ? parseInt(value) : value

  switch (unit) {
    case 'nanoseconds':
      timestampInSeconds = Math.floor(numValue / 1_000_000)
      break
    case 'milliseconds':
      timestampInSeconds = Math.floor(numValue / 1000)
      break
    case 'seconds':
    default:
      timestampInSeconds = numValue
      break
  }

  const date = showUtc ? dayjs.unix(timestampInSeconds).utc() : dayjs.unix(timestampInSeconds)
  const dateFormatted = date.format('MMM D, YYYY')
  const timeFormat = use24Hour ? 'HH:mm' : 'hh:mm A'
  const timeFormatted = date.format(timeFormat)
  const timeSuffix = showUtc ? ' UTC' : ''

  return <TitleAndSubCell title={dateFormatted} sub={`${timeFormatted}${timeSuffix}`} />
}
