import OrderBook from 'components/Trade/OrderBook'
import Trade from 'components/Trade/Trade'
import TradingView from 'components/Trade/TradingView'

interface Props {
  params: PageParams
}

export default function Tradepage(props: Props) {
  return (
    <div className='grid grid-flow-row grid-cols-3 grid-rows-2 gap-4'>
      <TradingView params={props.params} />
      <Trade params={props.params} />
      <OrderBook params={props.params} />
    </div>
  )
}
