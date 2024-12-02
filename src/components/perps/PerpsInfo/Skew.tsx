import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import usePerpsMarket from 'hooks/perps/usePerpsMarket'
import { BNCoin } from 'types/classes/BNCoin'

export default function Skew() {
  const perpsMarket = usePerpsMarket()

  if (!perpsMarket) return null

  const { openInterest } = perpsMarket
  const totalOI = openInterest.total

  return (
    <div className='flex items-center gap-1'>
      <DisplayCurrency
        className='text-sm hidden md:inline'
        coin={BNCoin.fromDenomAndBigNumber(perpsMarket.asset.denom, totalOI)}
      />
      <span className='text-sm hidden md:inline'>/</span>
      <FormattedNumber
        className='text-sm'
        amount={openInterest.skewPercentage.toNumber()}
        options={{
          suffix: '%',
          minDecimals: 2,
          maxDecimals: 2,
        }}
      />
    </div>
  )
}
