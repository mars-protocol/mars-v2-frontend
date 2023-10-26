import AssetRate from 'components/Asset/AssetRate'
import { byDenom } from 'utils/array'

export const APY_META = { accessorKey: 'apy', header: 'APY' }

interface Props {
  apy: number
  markets: Market[]
  denom: string
  type: 'deposits' | 'borrowing' | 'lending' | 'vault'
}

export default function Apr(props: Props) {
  const { markets, type, denom, apy } = props

  if (type === 'deposits') return <p className='w-full text-xs text-right number'>&ndash;</p>
  const isEnabled = markets.find(byDenom(denom))?.borrowEnabled ?? false

  return (
    <AssetRate
      className='justify-end text-xs'
      rate={apy}
      isEnabled={type !== 'lending' || isEnabled}
      type='apy'
      orientation='ltr'
    />
  )
}
