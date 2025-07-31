import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'

interface PerpsPriceHeaderProps {
  currentPrice: BigNumber
  assetSymbol: string
  assetDecimals: number
}

export function PerpsPriceHeader({
  currentPrice,
  assetSymbol,
  assetDecimals,
}: PerpsPriceHeaderProps) {
  return (
    <div className='flex items-center justify-start px-4 py-3 border-b border-white/10 bg-black/20'>
      <div className='flex flex-col items-start'>
        <FormattedNumber
          amount={currentPrice.toNumber()}
          options={{
            prefix: '$',
            maxDecimals: assetDecimals,
          }}
          className='text-base font-medium'
        />
        <Text size='xs' className='text-white/60'>
          Current Price of {assetSymbol}
        </Text>
      </div>
    </div>
  )
}
