import { Row } from '@tanstack/react-table'

import { FormattedNumber } from 'components/common/FormattedNumber'
import Loading from 'components/common/Loading'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import useMarket from 'hooks/markets/useMarket'
import { getLeveragedApy } from 'utils/math'

export const APY_RANGE_META = { header: 'APY range', accessorKey: 'farm.apy' }

export const apyRangeSortingFn = (a: Row<HlsFarm>, b: Row<HlsFarm>): number => {
  return (a.original.farm.apy || 0) - (b.original.farm.apy || 0)
}

interface Props {
  isLoading?: boolean
  hlsFarm: HlsFarm
}

export default function ApyRange(props: Props) {
  const baseApy = props.hlsFarm.farm.apy
  const borrowRate = useMarket(props.hlsFarm.borrowAsset.denom)?.apy.borrow

  if (!borrowRate || props.isLoading || !baseApy) {
    return <Loading />
  }

  const maxLevApy = getLeveragedApy(baseApy, borrowRate, props.hlsFarm.maxLeverage)

  const minApy = Math.min(baseApy, maxLevApy)
  const maxApy = Math.max(baseApy, maxLevApy)

  return (
    <TitleAndSubCell
      title={
        <>
          <FormattedNumber amount={minApy} options={{ suffix: '% to ' }} className='inline' />
          <FormattedNumber amount={maxApy} options={{ suffix: '%' }} className='inline' />
        </>
      }
      sub={
        <>
          <FormattedNumber amount={minApy / 365} options={{ suffix: '% to ' }} className='inline' />
          <FormattedNumber
            amount={maxApy / 365}
            options={{ suffix: '% daily' }}
            className='inline'
          />
        </>
      }
    />
  )
}
