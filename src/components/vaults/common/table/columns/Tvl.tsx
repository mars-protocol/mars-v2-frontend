import { FormattedNumber } from 'components/common/FormattedNumber'

export const TVL_META = {
  accessorKey: 'tvl',
  header: 'TVL',
  meta: { className: 'min-w-20' },
}

interface Props {
  value: number
  isLoading: boolean
}

export default function Tvl(props: Props) {
  const { value } = props

  return (
    <FormattedNumber
      amount={value}
      options={{ prefix: '$', minDecimals: 2, maxDecimals: 2, abbreviated: true }}
      className='text-xs'
      animate
    />
  )
}
