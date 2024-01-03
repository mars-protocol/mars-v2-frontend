import classNames from 'classnames'
import { useMemo } from 'react'

import DisplayCurrency from 'components/DisplayCurrency'
import Text from 'components/Text'
import { BN_ZERO } from 'constants/math'
import { ORACLE_DENOM } from 'constants/oracle'
import useAllAssets from 'hooks/assets/useAllAssets'
import usePrices from 'hooks/usePrices'
import { BNCoin } from 'types/classes/BNCoin'
import { formatAmountWithSymbol, getCoinValue } from 'utils/formatters'

interface Props {
  borrowings: BNCoin[]
  displayCurrency: string
}

export default function VaultBorrowingsSubTitle(props: Props) {
  const { data: prices } = usePrices()
  const assets = useAllAssets()
  const borrowingValue = useMemo(() => {
    let borrowingValue = BN_ZERO
    props.borrowings.map((coin) => {
      const price = prices.find((p) => p.denom === coin.denom)?.amount
      if (!price || coin.amount.isZero()) return
      borrowingValue = getCoinValue(coin, prices, assets)
    })
    return borrowingValue
  }, [props.borrowings, prices, assets])

  const borrowingTexts = useMemo(
    () =>
      props.borrowings.map((borrowing, index) => (
        <Text
          key={index}
          size='xs'
          className={classNames(
            'inline mt-1 text-white/60',
            index !== 0 && 'ml-1 before:pr-1 before:content-["+"]',
          )}
        >
          {formatAmountWithSymbol(borrowing.toCoin(), assets)}
        </Text>
      )),
    [assets, props.borrowings],
  )

  return (
    <>
      {props.borrowings.length > 0 && borrowingTexts}
      {props.borrowings.length > 0 && (
        <DisplayCurrency
          className={classNames(
            'text-xs mt-1 text-white/60 ml-1 inline',
            'before:content-["="] before:pr-1',
          )}
          coin={new BNCoin({ denom: ORACLE_DENOM, amount: borrowingValue.toString() })}
        />
      )}
    </>
  )
}
