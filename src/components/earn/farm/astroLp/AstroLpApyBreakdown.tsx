import classNames from 'classnames'
import AssetImage, { LogoUknown } from 'components/common/assets/AssetImage'
import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'
import { byDenom } from 'utils/array'
import { getSymbolFromUnknownAssetDenom } from 'utils/assets'

interface Props {
  astroLp: AstroLp | DepositedAstroLp
  assets?: Asset[]
  hlsInfo?: HlsApyInfo
}

export default function AstroLpApyBreakdown(props: Props) {
  const { astroLp, assets, hlsInfo } = props
  const borrowAsset = hlsInfo ? assets?.find(byDenom(hlsInfo.hlsFarm.borrowAsset.denom)) : undefined

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
        astroLp.incentives.map((incentive, index) => {
          const incentiveAsset = assets?.find(byDenom(incentive.denom))

          return (
            <div className='flex justify-between w-full' key={index}>
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
          <Text size='xs' className={classNames(!hlsInfo && 'font-bold')}>
            {hlsInfo ? 'Base APY (1x Leverage)' : 'Total'}
          </Text>
          <FormattedNumber
            className={classNames('text-xs', !hlsInfo && 'font-bold')}
            amount={astroLp.apy ?? 0}
            options={{ suffix: ' %', minDecimals: 2, maxDecimals: 2 }}
          />
        </div>
      )}
      {hlsInfo && borrowAsset && (
        <div className='flex justify-between w-full'>
          <Text size='xs'>{`Borrow Rate ${borrowAsset.symbol}`}</Text>
          <FormattedNumber
            className='text-xs'
            amount={hlsInfo.borrowRate}
            options={{ suffix: ' %', minDecimals: 2, maxDecimals: 2 }}
          />
        </div>
      )}
      {hlsInfo && (
        <div className='flex justify-between w-full'>
          <Text size='xs'>{`Max Lev. (${hlsInfo.hlsFarm.maxLeverage}x) APY`}</Text>
          <FormattedNumber
            className='text-xs'
            amount={hlsInfo.maxApy ?? 0}
            options={{ suffix: ' %', minDecimals: 2, maxDecimals: 2 }}
          />
        </div>
      )}
    </div>
  )
}
