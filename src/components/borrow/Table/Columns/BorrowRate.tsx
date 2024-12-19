import { FormattedNumber } from 'components/common/FormattedNumber'
import Loading from 'components/common/Loading'

export const BORROW_RATE_META = {
  accessorKey: 'apy.borrow',
  header: 'Borrow Rate APY',
  meta: { className: 'min-w-20' },
}

interface Props {
  borrowRate: number | null
}

export default function BorrowRate(props: Props) {
  if (props.borrowRate === null) {
    return <Loading />
  }

  return (
    <FormattedNumber
      className='justify-end text-xs'
      amount={props.borrowRate}
      options={{ minDecimals: 2, maxDecimals: 2, suffix: '%' }}
    />
  )
}
