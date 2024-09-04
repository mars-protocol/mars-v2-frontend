import { FormattedNumber } from 'components/common/FormattedNumber'
import Loading from 'components/common/Loading'

export const APY_META = {
  accessorKey: 'apy',
  header: 'APY',
  meta: { className: 'min-w-20' },
}

interface Props {
  value: number
  isLoading: boolean
}

export default function Apy(props: Props) {
  const { value, isLoading } = props

  if (isLoading) return <Loading />

  return (
    <FormattedNumber
      amount={value}
      options={{ minDecimals: 2, maxDecimals: 2, suffix: '%' }}
      className='text-xs'
      animate
    />
  )
}
