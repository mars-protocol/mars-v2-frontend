import AssetRate from 'components/common/assets/AssetRate'
import { byDenom } from 'utils/array'

export const APY_META = { accessorKey: 'apy', header: 'APY', meta: { className: 'w-30' } }

interface Props {
  apy: number
  markets: Market[]
  denom: string
  type: PositionType
}

export default function Apr(props: Props) {
  const { markets, type, denom, apy } = props

  if (apy === 0) return <p className='w-full text-xs text-right number'>&ndash;</p>
  const isEnabled = markets.find(byDenom(denom))?.borrowEnabled ?? false

  return (
    <AssetRate
      className='justify-end text-xs'
      rate={apy}
      isEnabled={type !== 'lend' || isEnabled}
      type='apy'
      orientation='ltr'
    />
  )
}
