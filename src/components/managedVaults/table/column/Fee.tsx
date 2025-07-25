import { FormattedNumber } from 'components/common/FormattedNumber'
import Loading from 'components/common/Loading'

export const FEE_META = {
  accessorKey: 'fee_rate',
  header: 'Fee',
  meta: { className: 'w-25' },
}

interface Props {
  value: number
  isLoading: boolean
}

export default function Fee(props: Props) {
  const { value, isLoading } = props

  if (isLoading) return <Loading />

  return (
    <FormattedNumber
      amount={value}
      options={{ minDecimals: 2, maxDecimals: 2, suffix: '%' }}
      className='text-xs'
    />
  )
}
