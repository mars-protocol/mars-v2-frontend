import { FormattedNumber } from 'components/common/FormattedNumber'
import Loading from 'components/common/Loading'

export const FREEZE_PERIOD_META = {
  accessorKey: 'freeze_period',
  header: 'Freeze Period',
  meta: { className: 'w-30' },
}

interface Props {
  value: string
  isLoading: boolean
}

export default function FreezePeriod(props: Props) {
  const { value, isLoading } = props

  if (isLoading) return <Loading />

  return (
    <FormattedNumber
      amount={parseFloat(value)}
      options={{ minDecimals: 0, maxDecimals: 0, suffix: ' hours' }}
      className='text-xs'
    />
  )
}
