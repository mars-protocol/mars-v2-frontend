import { useMemo } from 'react'

import DisplayCurrency from 'components/DisplayCurrency'
import { BN_ZERO } from 'constants/math'
import usePrices from 'hooks/usePrices'
import { BNCoin } from 'types/classes/BNCoin'
import { convertToDisplayAmount, formatAmountWithSymbol } from 'utils/formatters'

interface Props {
  borrowings: BNCoin[]
  displayCurrency: string
}

export default function VaultBorrowingsSubTitle(props: Props) {
  const { data: prices } = usePrices()

  const [borrowingTexts, borrowingValue] = useMemo(() => {
    const texts: string[] = []
    let borrowingValue = BN_ZERO
    props.borrowings.map((coin) => {
      const price = prices.find((p) => p.denom === coin.denom)?.amount
      if (!price || coin.amount.isZero()) return
      borrowingValue = convertToDisplayAmount(coin, props.displayCurrency, prices)
      texts.push(
        formatAmountWithSymbol({
          denom: coin.denom,
          amount: coin.amount.toString(),
        }),
      )
    })
    return [texts, borrowingValue]
  }, [props.borrowings, prices, props.displayCurrency])

  return (
    <>
      {borrowingTexts.join(' + ')}
      {borrowingTexts.length > 0 && (
        <DisplayCurrency
          className='before:content-["="] before:pr-1 ml-1 indent-10 inline'
          coin={new BNCoin({ denom: props.displayCurrency, amount: borrowingValue.toString() })}
        />
      )}
    </>
  )
}
