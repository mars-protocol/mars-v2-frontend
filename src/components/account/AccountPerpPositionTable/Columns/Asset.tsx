import Text from 'components/common/Text'
import TradeDirection from 'components/perps/BalancesTable/Columns/TradeDirection'
export const ASSET_META = { accessorKey: 'symbol', header: 'Asset', id: 'symbol' }

interface Props {
  symbol: string
  tradeDirection: TradeDirection
}

export default function Asset(props: Props) {
  const { symbol, tradeDirection } = props
  return (
    <Text size='xs' className='flex items-center gap-1 no-wrap'>
      {symbol}
      <TradeDirection tradeDirection={tradeDirection} />
    </Text>
  )
}
