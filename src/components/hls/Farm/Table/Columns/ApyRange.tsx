import { Row } from '@tanstack/react-table'

import { FormattedNumber } from 'components/common/FormattedNumber'
import Loading from 'components/common/Loading'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import { Tooltip } from 'components/common/Tooltip'
import AstroLpApyBreakdown from 'components/earn/farm/astroLp/AstroLpApyBreakdown'
import ConditionalWrapper from 'hocs/ConditionalWrapper'
import useMarket from 'hooks/markets/useMarket'
import { getLeveragedApy } from 'utils/math'

export const APY_RANGE_META = { header: 'APY range', accessorKey: 'farm.apy' }

export const apyRangeSortingFn = (a: Row<HlsFarm>, b: Row<HlsFarm>): number => {
  return (a.original.farm.apy || 0) - (b.original.farm.apy || 0)
}

interface Props {
  isLoading?: boolean
  assets: Asset[]
  hlsFarm: HlsFarm
}

export default function ApyRange(props: Props) {
  const { hlsFarm, assets } = props
  const baseApy = hlsFarm.farm.apy
  const borrowRate = useMarket(hlsFarm.borrowAsset.denom)?.apy.borrow

  if (!borrowRate || props.isLoading || !baseApy) {
    return <Loading />
  }

  const maxLevApy = getLeveragedApy(baseApy, borrowRate, hlsFarm.maxLeverage)

  const minApy = Math.min(baseApy, maxLevApy)
  const maxApy = Math.max(baseApy, maxLevApy)

  const hlsInfo: HlsApyInfo = {
    hlsFarm,
    borrowRate,
    maxApy: maxApy === baseApy ? minApy : maxApy,
  }

  return (
    <ConditionalWrapper
      condition={!!(hlsFarm.farm.incentives && assets)}
      wrapper={(children) => (
        <Tooltip
          content={<AstroLpApyBreakdown astroLp={hlsFarm.farm} assets={assets} hlsInfo={hlsInfo} />}
          type='info'
          className='ml-1'
        >
          <div className='inline-block border-b border-dashed hover:cursor-help border-white/40 hover:border-transparent mb-1.5'>
            {children}
          </div>
        </Tooltip>
      )}
    >
      <TitleAndSubCell
        title={
          <>
            <FormattedNumber amount={minApy} options={{ suffix: '% to ' }} className='inline' />
            <FormattedNumber amount={maxApy} options={{ suffix: '%' }} className='inline' />
          </>
        }
        sub={
          <>
            <FormattedNumber
              amount={minApy / 365}
              options={{ suffix: '% to ' }}
              className='inline'
            />
            <FormattedNumber
              amount={maxApy / 365}
              options={{ suffix: '% daily' }}
              className='inline'
            />
          </>
        }
      />
    </ConditionalWrapper>
  )
}
