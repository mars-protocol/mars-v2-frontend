import OrderBook from 'components/Trade/OrderBook'
import Trade from 'components/Trade/Trade'
import TradingView from 'components/Trade/TradingView'
import useDepositedVaults from 'hooks/useDepositedVaults'

export default function TradePage() {
  const { data } = useDepositedVaults('60')
  const { data: data2 } = useDepositedVaults('66')
  const { data: data3 } = useDepositedVaults('65')
  console.log(data)
  console.log(data2)
  console.log(data3)

  return (
    <div className='grid w-full grid-flow-row grid-cols-3 grid-rows-2 gap-4'>
      <TradingView />
      <Trade />
      <OrderBook />
    </div>
  )
}
