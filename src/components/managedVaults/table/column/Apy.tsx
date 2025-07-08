import { FormattedNumber } from 'components/common/FormattedNumber'
import Loading from 'components/common/Loading'
import { Row } from '@tanstack/react-table'
import { convertAprToApy } from 'utils/parsers'

export const APY_META = {
  id: 'apy',
  header: 'APY',
  accessorKey: 'apr',
  meta: { className: 'w-30' },
  sortingFn: (a: Row<ManagedVaultWithDetails>, b: Row<ManagedVaultWithDetails>) => {
    const apyA = convertAprToApy(Number(a.original.apr ?? 0), 365)
    const apyB = convertAprToApy(Number(b.original.apr ?? 0), 365)
    return apyA - apyB
  },
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
