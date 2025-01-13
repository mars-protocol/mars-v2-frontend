import { FormattedNumber } from 'components/common/FormattedNumber'
import Loading from 'components/common/Loading'

export const SHARES_META = {
  id: 'shares',
  header: 'Shares',
  meta: { className: 'min-w-20' },
}

interface Props {
  // TODO: update once we know data structure
  value: any
  isLoading: boolean
}

export default function Shares(props: Props) {
  const { value, isLoading } = props

  if (isLoading) return <Loading />

  return (
    <FormattedNumber
      amount={parseFloat(value)}
      options={{ minDecimals: 0, maxDecimals: 0 }}
      className='text-xs'
    />
  )
}
