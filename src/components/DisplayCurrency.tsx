import { FormattedNumber } from 'components/FormattedNumber'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { convertToDisplayAmount } from 'utils/formatters'

interface Props {
  coin: BNCoin
  className?: string
  isApproximation?: boolean
}

export default function DisplayCurrency(props: Props) {
  const displayCurrency = useStore((s) => s.displayCurrency)
  const prices = useStore((s) => s.prices)

  return (
    <FormattedNumber
      className={props.className}
      amount={convertToDisplayAmount(props.coin, displayCurrency, prices)}
      options={{
        minDecimals: 0,
        maxDecimals: 2,
        abbreviated: true,
        prefix: `${props.isApproximation ? '~ ' : ''}${
          displayCurrency.prefix ? displayCurrency.prefix : ''
        }`,
        suffix: displayCurrency.symbol ? ` ${displayCurrency.symbol}` : '',
      }}
    />
  )
}
