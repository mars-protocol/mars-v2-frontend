import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'
import { BN_ZERO } from 'constants/math'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import usePerpsMarket from 'hooks/perps/usePerpsMarket'
import { useMemo } from 'react'

interface PerpsPriceHeaderProps {
  currentPrice: BigNumber
  assetSymbol: string
  assetDecimals: number
  assetPrice?: BigNumber
}

export function PerpsPriceHeader({
  currentPrice,
  assetSymbol,
  assetDecimals,
  assetPrice,
}: PerpsPriceHeaderProps) {
  const perpsMarket = usePerpsMarket()

  const totalOpenInterestUsd = useMemo(() => {
    if (!perpsMarket || !assetPrice) return BN_ZERO
    return perpsMarket.openInterest.total.times(assetPrice).shiftedBy(-PRICE_ORACLE_DECIMALS)
  }, [perpsMarket, assetPrice])

  return (
    <div className='flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/20'>
      <div className='flex flex-col'>
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
      <div className='flex flex-col items-end'>
        <FormattedNumber
          amount={totalOpenInterestUsd.toNumber()}
          options={{
            prefix: '$',
            abbreviated: true,
          }}
          className='text-base font-medium'
        />
        <Text size='xs' className='text-white/60'>
          Total Open Interest
        </Text>
      </div>
    </div>
  )
}
