import { FormattedNumber } from 'components/common/FormattedNumber'
import Loading from 'components/common/Loading'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import AstroLpApyBreakdown from 'components/earn/farm/astroLp/AstroLpApyBreakdown'
import ConditionalWrapper from 'hocs/ConditionalWrapper'

export const APY_META = { accessorKey: 'apy', header: 'APY' }

interface Props {
  astroLp: AstroLp | DepositedAstroLp
  assets?: Asset[]
}

export default function AstroLpApy(props: Props) {
  const { astroLp, assets } = props

  if (astroLp.apy === undefined) return <Loading />
  if (astroLp.apy === null) return <Text size='xs'>N/A</Text>

  return (
    <ConditionalWrapper
      condition={!!(astroLp.incentives && assets)}
      wrapper={(children) => (
        <Tooltip
          content={<AstroLpApyBreakdown astroLp={astroLp} assets={assets} />}
          type='info'
          className='ml-1'
        >
          <div className='inline-block border-b border-dashed hover:cursor-help border-white/40 hover:border-transparent mb-1.5'>
            {children}
          </div>
        </Tooltip>
      )}
    >
      <FormattedNumber
        amount={astroLp.apy ?? 0}
        options={{ minDecimals: 2, maxDecimals: 2, suffix: '%' }}
        className='text-xs'
      />
    </ConditionalWrapper>
  )
}
