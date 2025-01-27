import { FormattedNumber } from 'components/common/FormattedNumber'
import Loading from 'components/common/Loading'
import moment from 'moment'

export const FREEZE_PERIOD_META = {
  accessorKey: 'freeze_period',
  header: 'Freeze Period',
  meta: { className: 'w-30' },
}

interface Props {
  value: number
  isLoading: boolean
}

export default function FreezePeriod(props: Props) {
  const { value, isLoading } = props

  const hours = moment.duration(value, 'seconds').asHours()

  if (isLoading) return <Loading />

  return (
    <FormattedNumber
      amount={hours}
      options={{
        minDecimals: 0,
        maxDecimals: 0,
        suffix: ' hours',
      }}
      className='text-xs'
    />
  )
}
