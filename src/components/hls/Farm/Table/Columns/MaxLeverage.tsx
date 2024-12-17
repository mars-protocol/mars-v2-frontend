import { FormattedNumber } from 'components/common/FormattedNumber'

export const MAX_LEV_META = { accessorKey: 'hls.maxLeverage', header: 'Max Leverage' }
interface Props {
  farm: HlsFarm
}

export default function MaxLeverage(props: Props) {
  return (
    <FormattedNumber
      amount={props.farm.maxLeverage || 1}
      options={{ minDecimals: 2, maxDecimals: 2, suffix: 'x' }}
      className='text-xs'
    />
  )
}
