import AssetRate from 'components/common/assets/AssetRate'
import Loading from 'components/common/Loading'
import Text from 'components/common/Text'

export const APY_META = { accessorKey: 'apy', header: 'APY', meta: { className: 'w-30 pr-4' } }

interface Props {
  apy?: number | null
  markets: Market[]
  denom: string
  type: PositionType
}

export default function Apr(props: Props) {
  const { markets, type, denom, apy } = props

  if (apy === undefined) return <Loading />
  if (apy === null) return <Text size='xs'>N/A</Text>

  if (apy === 0) return <p className='w-full text-xs text-right number'>&ndash;</p>

  const isEnabled =
    markets.find((market) => market.asset.denom === props.denom)?.borrowEnabled ?? false

  return (
    <AssetRate
      className='justify-end text-xs my-auto'
      rate={apy}
      isEnabled={type !== 'lend' || isEnabled}
      type='apy'
      orientation='ltr'
    />
  )
}
