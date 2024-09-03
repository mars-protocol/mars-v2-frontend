import { FormattedNumber } from 'components/common/FormattedNumber'

export const FREEZE_PERIOD_META = {
  accessorKey: 'freeze_period',
  header: 'Freeze Period',
  meta: { className: 'min-w-20' },
}

interface Props {
  value: number
  isLoading: boolean
}

export default function FreezePeriod(props: Props) {
  const { value } = props

  return (
    <FormattedNumber
      amount={value}
      options={{ minDecimals: 0, maxDecimals: 0, suffix: ' hours' }}
      className='text-xs'
      animate
    />
  )
}
