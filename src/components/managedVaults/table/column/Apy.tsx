import { FormattedNumber } from 'components/common/FormattedNumber'
import Loading from 'components/common/Loading'

export const APY_META = {
  id: 'apy',
  header: 'APY',
  accessorKey: 'apr',
  meta: { className: 'w-30' },
}

interface Props {
  apy: number
  isLoading: boolean
}
export default function Apy(props: Props) {
  if (props.isLoading) return <Loading />
  const apy = props.apy ?? 0
  return (
    <FormattedNumber
      amount={apy}
      className='justify-end text-xs'
      options={{
        suffix: '%',
        maxDecimals: apy > 100 ? 0 : 2,
        minDecimals: apy > 100 ? 0 : 2,
        abbreviated: false,
      }}
    />
  )
}
