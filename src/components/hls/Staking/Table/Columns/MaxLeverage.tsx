import { FormattedNumber } from 'components/common/FormattedNumber'

export const MAX_LEV_META = {
  accessorKey: 'maxLeverage',
  header: 'Max Leverage',
  meta: { className: 'min-w-40' },
}

interface Props {
  strategy: HlsStrategy
}

export default function MaxLeverage(props: Props) {
  return (
    <FormattedNumber
      amount={props.strategy.maxLeverage}
      options={{ minDecimals: 2, maxDecimals: 2, suffix: 'x', prefix: '~' }}
      className='text-xs'
    />
  )
}
