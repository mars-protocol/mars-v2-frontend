import DisplayCurrency from 'components/common/DisplayCurrency'
import usePerpsMarket from 'hooks/perps/usePerpsMarket'
import { BNCoin } from 'types/classes/BNCoin'

export default function TotalOpenInterest() {
  const perpsMarket = usePerpsMarket()

  if (!perpsMarket) return null

  const { openInterest } = perpsMarket
  const totalOI = openInterest.total

  return (
    <div className='flex items-center gap-1'>
      <DisplayCurrency
        className='hidden text-sm md:inline'
        coin={BNCoin.fromDenomAndBigNumber(perpsMarket.asset.denom, totalOI)}
      />
    </div>
  )
}
