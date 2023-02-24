import { Card } from 'components/Card'

export default function page() {
  return (
    <div className='flex w-full flex-wrap'>
      <div className='mb-4 flex flex-grow gap-4'>
        <Card title='TradingView graph' className='flex-1'>
          <></>
        </Card>
        <div className='flex flex-col gap-4'>
          <Card title='Orderbook module'>
            <></>
          </Card>
        </div>
      </div>
      <Card title='Order history'>
        <></>
      </Card>
    </div>
  )
}
