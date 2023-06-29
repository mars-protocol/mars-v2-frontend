import BigNumber from 'bignumber.js'
import { useMemo } from 'react'

import DisplayCurrency from 'components/DisplayCurrency'
import usePrices from 'hooks/usePrices'
import useStore from 'store'
import { formatAmountWithSymbol } from 'utils/formatters'
import { BN } from 'utils/helpers'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  borrowings: BNCoin[]
}

export default function VaultDepositSubTitle(props: Props) {
  const baseCurrency = useStore((s) => s.baseCurrency)
  const { data: prices } = usePrices()

  const [borrowingTexts, borrowingValue] = useMemo(() => {
    const texts: string[] = []
    let borrowingValue = BN(0)
    props.borrowings.map((coin) => {
      const price = prices.find((p) => p.denom === coin.denom)?.amount
      if (!price || coin.amount.isZero()) return
      borrowingValue = borrowingValue.plus(coin.amount.times(price))
      texts.push(
        formatAmountWithSymbol({
          denom: coin.denom,
          amount: coin.amount.toString(),
        }),
      )
    })
    return [texts, borrowingValue]
  }, [props.borrowings, prices])

  return (
    <>
      {borrowingTexts.join(' + ')}
      {borrowingTexts.length > 0 && (
        <>
          {` = `}
          <DisplayCurrency
            coin={new BNCoin({ denom: baseCurrency.denom, amount: borrowingValue.toString() })}
          />
        </>
      )}
    </>
  )
}
