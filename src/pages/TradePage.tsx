import OrderBook from 'components/Trade/OrderBook'
import TradeModule from 'components/Trade/TradeModule'
import TradingView from 'components/Trade/TradingView'

export default function TradePage() {
  return (
    <div className=' grid w-full grid-cols-[346px_auto] gap-4'>
      <TradeModule />
      <TradingView />
      <OrderBook />
    </div>
  )
}
