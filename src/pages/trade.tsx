import { Card, Text } from 'components'
import { TradeActionModule } from 'components/Trade'

const Trade = () => {
  return (
    <div className='flex w-full flex-wrap'>
      <div className='mb-4 flex flex-grow gap-4'>
        <Card className='flex-1'>
          <Text size='lg' uppercase>
            Tradingview Graph
          </Text>
        </Card>
        <div className='flex flex-col gap-4'>
          <Card>
            <TradeActionModule />
          </Card>
          <Card>
            <Text size='lg' uppercase>
              Orderbook module (optional)
            </Text>
          </Card>
        </div>
      </div>
      <Card>
        <Text size='lg' uppercase>
          Order history
        </Text>
      </Card>
    </div>
  )
}

export default Trade
