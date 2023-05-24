import { Helmet } from 'react-helmet'

import Trade from 'components/Trade/Trade'
import OrderBook from 'components/Trade/OrderBook'
import TradingView from 'components/Trade/TradingView'

export default function TradePage() {
  return (
    <div className='grid w-full grid-flow-row grid-cols-3 grid-rows-2 gap-4'>
      <TradingView />
      <Trade />
      <OrderBook />
    </div>
  )
}
