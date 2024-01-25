import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'

interface Props {
  availableLiquidity: BigNumber
  asset: BorrowAsset
}

export default function AvailableLiquidityMessage(props: Props) {
  const { availableLiquidity, asset } = props
  return (
    <div className='flex items-start p-4 bg-white/5'>
      <div className='flex flex-col gap-2'>
        <Text size='sm'>Not enough Liquidty!</Text>
        <Text size='xs' className='text-white/40'>
          {`This transaction would exceed the amount of ${asset.symbol} currently available for borrowing on Mars.`}
        </Text>

        <div className='flex gap-1'>
          <Text size='xs'>Available Liquidity:</Text>
          <FormattedNumber
            amount={availableLiquidity.toNumber()}
            options={{
              abbreviated: true,
              decimals: asset.decimals,
              suffix: ` ${asset.symbol}`,
            }}
            className='text-xs text-white/60'
          />
        </div>
      </div>
    </div>
  )
}
