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
  vault: Vault | DepositedVault
  assets?: Asset[]
}

export default function Apy(props: Props) {
  const { vault, assets } = props

  if (vault.apy === undefined) return <Loading />
  if (vault.apy === null) return <Text size='xs'>N/A</Text>

  return (
    <ConditionalWrapper
      condition={!!(vault.incentives && assets)}
      wrapper={(children) => (
        <Tooltip
          content={<ApyBreakdown vault={vault} assets={assets} />}
          type='info'
          className='ml-1'
        >
          <div className='inline-block border-b border-dashed hover:cursor-help border-white/40 hover:border-transparent'>
            {children}
          </div>
        </Tooltip>
      )}
    >
      <FormattedNumber
        amount={vault.apy ?? 0}
        options={{ minDecimals: 2, maxDecimals: 2, suffix: '%' }}
        className='text-xs'
        animate
      />
    </ConditionalWrapper>
  )
}

function ApyBreakdown(props: Props) {
  const { vault, assets } = props

  return (
    <div className='flex w-[200px] flex-wrap gap-2'>
      <div className='flex justify-between w-full'>
        <Text size='xs'>Swap Fees</Text>
        <FormattedNumber
          className='text-xs'
          amount={vault.baseApy ?? 0}
          options={{ suffix: ' %', minDecimals: 2, maxDecimals: 2 }}
        />
      </div>
      {vault.incentives &&
        vault.incentives.map((incentive) => {
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
      {vault.incentives && (
        <div className='flex justify-between w-full pt-2 border-t border-white/20'>
          <Text size='xs' className='font-bold'>
            Total
          </Text>
          <FormattedNumber
            className='text-xs font-bold'
            amount={vault.apy ?? 0}
            options={{ suffix: ' %', minDecimals: 2, maxDecimals: 2 }}
          />
        </div>
      )}
    </div>
  )
}
