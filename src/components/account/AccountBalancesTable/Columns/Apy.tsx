import AssetRate from 'components/common/assets/AssetRate'
import { FormattedNumber } from 'components/common/FormattedNumber'
import Loading from 'components/common/Loading'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'

export const APY_META = { accessorKey: 'apy', header: 'APY', meta: { className: 'w-30 pr-4' } }

interface Props {
  apy?: number | null
  markets: Market[]
  denom: string
  type: PositionType
  hasCampaignApy?: boolean
  lstApy?: number
}

export default function Apy(props: Props) {
  const { markets, type, denom, apy, hasCampaignApy, lstApy = 0 } = props

  if (apy === undefined) return <Loading />
  if (apy === null) return <Text size='xs'>N/A</Text>

  const isEnabled = markets.find((market) => market.asset.denom === denom)?.borrowEnabled ?? false
  const hasLstApy = type !== 'borrow' && lstApy > 0
  const totalApy = type === 'borrow' ? apy : apy + lstApy

  return (
    <div className='flex justify-end my-auto text-xs'>
      {hasLstApy ? (
        <Tooltip content='Includes underlying staking or rewards APY' type='info'>
          <div className='border-b border-dashed hover:cursor-help border-white/40 hover:border-transparent'>
            <FormattedNumber
              amount={totalApy}
              options={{ suffix: '%', minDecimals: 2, maxDecimals: 2, abbreviated: true }}
            />
          </div>
        </Tooltip>
      ) : (
        <AssetRate
          className='justify-end my-auto text-xs'
          rate={totalApy}
          isEnabled={type !== 'lend' || isEnabled}
          type='apy'
          orientation='ltr'
          hasCampaignApy={hasCampaignApy}
        />
      )}
    </div>
  )
}
