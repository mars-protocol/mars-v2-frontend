import AssetImage, { LogoUknown } from 'components/common/assets/AssetImage'
import { FormattedNumber } from 'components/common/FormattedNumber'
import Loading from 'components/common/Loading'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import ConditionalWrapper from 'hocs/ConditionalWrapper'
import { byDenom } from 'utils/array'
import { getSymbolFromUnknownAssetDenom } from 'utils/assets'

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
          content={<ApyBreakdown astroLp={astroLp} assets={assets} />}
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
        animate
      />
    </ConditionalWrapper>
  )
}

function ApyBreakdown(props: Props) {
  const { astroLp, assets } = props

  return (
    <div className='flex w-[200px] flex-wrap gap-2'>
      <div className='flex justify-between w-full'>
        <Text size='xs'>Swap Fees</Text>
        <FormattedNumber
          className='text-xs'
          amount={astroLp.baseApy ?? 0}
          options={{ suffix: ' %', minDecimals: 2, maxDecimals: 2 }}
        />
      </div>
      {astroLp.incentives &&
        astroLp.incentives.map((incentive) => {
          const incentiveAsset = assets?.find(byDenom(incentive.denom))

          return (
            <div className='flex justify-between w-full'>
              <div className='flex'>
                {!incentiveAsset ? (
                  <div className='w-4 h-4'>
                    <LogoUknown />
                  </div>
                ) : (
                  <AssetImage asset={incentiveAsset} className='w-4 h-4' />
                )}
                <Text size='xs' className='ml-2'>
                  {incentiveAsset
                    ? incentiveAsset.symbol
                    : getSymbolFromUnknownAssetDenom(incentive.denom)}
                </Text>
              </div>
              <FormattedNumber
                className='text-xs'
                amount={incentive.yield * 100}
                options={{ suffix: ' %', minDecimals: 2, maxDecimals: 2 }}
              />
            </div>
          )
        })}
      {astroLp.incentives && (
        <div className='flex justify-between w-full pt-2 border-t border-white/20'>
          <Text size='xs' className='font-bold'>
            Total
          </Text>
          <FormattedNumber
            className='text-xs font-bold'
            amount={astroLp.apy ?? 0}
            options={{ suffix: ' %', minDecimals: 2, maxDecimals: 2 }}
          />
        </div>
      )}
    </div>
  )
}
