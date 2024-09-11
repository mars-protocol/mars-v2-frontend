import { FormattedNumber } from 'components/common/FormattedNumber'
import Loading from 'components/common/Loading'

export const TVL_META = {
  accessorKey: 'tvl',
  header: 'TVL',
  meta: { className: 'w-25' },
}

interface Props {
  value: number
  isLoading: boolean
}

export default function Tvl(props: Props) {
  const { value, isLoading } = props

  if (isLoading) return <Loading />

  return (
    <FormattedNumber
      amount={value}
      options={{ prefix: '$', minDecimals: 2, maxDecimals: 2, abbreviated: true }}
      className='text-xs'
      animate
    />
  )
}
