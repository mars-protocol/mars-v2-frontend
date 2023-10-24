import AssetRate from 'components/Asset/AssetRate'
import Loading from 'components/Loading'
import { convertAprToApy } from 'utils/parsers'

export const APY_META = { accessorKey: 'marketLiquidityRate', header: 'APY' }

interface Props {
  marketLiquidityRate: number
  borrowEnabled: boolean
  isLoading: boolean
}
export default function Apr(props: Props) {
  if (props.isLoading) return <Loading />

  return (
    <AssetRate
      rate={convertAprToApy((props.marketLiquidityRate ?? 0) * 100, 365)}
      isEnabled={props.borrowEnabled}
      className='justify-end text-xs'
      type='apy'
      orientation='ltr'
    />
  )
}
