import BigNumber from 'bignumber.js'
import { useMemo } from 'react'

import DisplayCurrency from 'components/DisplayCurrency'
import usePrices from 'hooks/usePrices'
import useStore from 'store'
import { formatAmountWithSymbol } from 'utils/formatters'
import { BN } from 'utils/helpers'

interface Props {
  borrowings: Map<string, BigNumber>
}

export default function VaultDepositSubTitle(props: Props) {
  const baseCurrency = useStore((s) => s.baseCurrency)
  const { data: prices } = usePrices()

  const [borrowingTexts, borrowingValue] = useMemo(() => {
    const texts: string[] = []
    let borrowingValue = BN(0)
    Array.from(props.borrowings.entries()).forEach(([denom, amount]) => {
      const price = prices.find((p) => p.denom === denom)?.amount
      if (!price || amount.isZero()) return
      borrowingValue = borrowingValue.plus(amount.times(price))
      texts.push(
        formatAmountWithSymbol({
          denom,
          amount: amount.toString(),
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
            coin={{ denom: baseCurrency.denom, amount: borrowingValue.toString() }}
          />
        </>
      )}
    </>
  )
}
