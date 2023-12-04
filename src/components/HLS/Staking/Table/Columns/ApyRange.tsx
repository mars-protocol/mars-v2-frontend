import { Row } from '@tanstack/react-table'

import { FormattedNumber } from 'components/FormattedNumber'
import Loading from 'components/Loading'
import TitleAndSubCell from 'components/TitleAndSubCell'
import useBorrowAsset from 'hooks/useBorrowAsset'
import { getLeveragedApy } from 'utils/math'

export const APY_RANGE_META = { header: 'APY range', accessorKey: 'apy' }

export const apyRangeSortingFn = (a: Row<HLSStrategy>, b: Row<HLSStrategy>): number => {
  return (a.original.apy || 0) - (b.original.apy || 0)
}

interface Props {
  isLoading?: boolean
  strategy: HLSStrategy
}

export default function ApyRange(props: Props) {
  const baseApy = props.strategy.apy
  const borrowRate = useBorrowAsset(props.strategy.denoms.borrow)?.borrowRate

  if (!borrowRate || props.isLoading || !baseApy) {
    return <Loading />
  }

  const maxLevApy = getLeveragedApy(baseApy, borrowRate, props.strategy.maxLeverage)

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
