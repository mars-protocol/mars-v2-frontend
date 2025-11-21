import Text from 'components/common/Text'

interface Props {
  symbol: string
}

export default function TradingViewAttribution(props: Props) {
  const { symbol } = props
  const tradingViewSymbol = symbol.replace('/', '')
  const tradingViewUrl = `https://www.tradingview.com/symbols/${tradingViewSymbol}/`

  return (
    <div className='flex items-center justify-start gap-1'>
      <Text size='2xs' className='text-white/60'>
        TradingView is a platform for traders and high-performance market data to help track{' '}
        <a
          href={tradingViewUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='text-white/80 hover:text-white underline'
        >
          {symbol}
        </a>{' '}
        price on charts.
      </Text>
    </div>
  )
}
