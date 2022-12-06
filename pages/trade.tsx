import Card from 'components/Card'
import Text from 'components/Text'
import TradeActionModule from 'components/Trade/TradeActionModule'

const Trade = () => {
  return (
    <div className='flex w-full flex-wrap'>
      <div className='mb-4 flex flex-grow gap-4'>
        <Card className='flex-1'>
          <Text size='lg' uppercase={true}>
            Tradingview Graph
          </Text>
        </Card>
        <div className='flex flex-col gap-4'>
          <Card>
            <TradeActionModule />
          </Card>
          <Card>
            <Text size='lg' uppercase={true}>
              Orderbook module (optional)
            </Text>
          </Card>
        </div>
      </div>
      <Card>
        <Text size='lg' uppercase={true}>
          Order history
        </Text>
      </Card>
    </div>
  )
}

export default Trade
