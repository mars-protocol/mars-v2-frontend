import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'

interface Props {
  market: Market
}

export default function AvailableLiquidityMessage(props: Props) {
  const { market } = props
  return (
    <div className='flex items-start p-4 bg-white/5'>
      <div className='flex flex-col gap-2'>
        <Text size='sm'>Not enough Liquidity!</Text>
        <Text size='xs' className='text-white/40'>
          {`This transaction would exceed the amount of ${market.asset.symbol} currently available for borrowing on Mars.`}
        </Text>

        <div className='flex gap-1'>
          <Text size='xs'>Available Liquidity:</Text>
          <FormattedNumber
            amount={market.liquidity.toNumber()}
            options={{
              abbreviated: true,
              decimals: market.asset.decimals,
              suffix: ` ${market.asset.symbol}`,
            }}
            className='text-xs text-white/60'
          />
        </div>
      </div>
    </div>
  )
}
