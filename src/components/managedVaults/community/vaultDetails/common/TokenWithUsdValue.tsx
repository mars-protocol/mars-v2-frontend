import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  tokenAmount: BigNumber
  denom: string
  symbol: string
  usdAmount: BigNumber
}

export default function TokenWithUsdValue(props: Props) {
  const { tokenAmount, denom, symbol, usdAmount } = props

  return (
    <div className='flex items-center gap-2'>
      <FormattedNumber
        amount={Number(tokenAmount)}
        options={{
          minDecimals: 0,
          maxDecimals: 2,
          suffix: ` ${symbol}`,
        }}
      />
      <span className='text-white/10'>|</span>
      <DisplayCurrency coin={BNCoin.fromDenomAndBigNumber(denom, usdAmount)} />
    </div>
  )
}
