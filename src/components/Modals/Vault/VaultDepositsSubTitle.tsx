import BigNumber from 'bignumber.js'

import DisplayCurrency from 'components/DisplayCurrency'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { DISPLAY_CURRENCY_KEY } from 'constants/localStore'
import useLocalStorage from 'hooks/useLocalStorage'
import usePrices from 'hooks/usePrices'
import { BNCoin } from 'types/classes/BNCoin'
import { formatAmountWithSymbol } from 'utils/formatters'
import { getTotalValueFromBNCoins } from 'utils/helpers'

interface Props {
  primaryAmount: BigNumber
  secondaryAmount: BigNumber
  primaryAsset: Asset
  secondaryAsset: Asset
  displayCurrency: string
}

export default function VaultDepositSubTitle(props: Props) {
  const { data: prices } = usePrices()
  const primaryText = formatAmountWithSymbol({
    denom: props.primaryAsset.denom,
    amount: props.primaryAmount.toString(),
  })
  const secondaryText = formatAmountWithSymbol({
    denom: props.secondaryAsset.denom,
    amount: props.secondaryAmount.toString(),
  })

  const positionValue = getTotalValueFromBNCoins(
    [
      BNCoin.fromDenomAndBigNumber(props.primaryAsset.denom, props.primaryAmount),
      BNCoin.fromDenomAndBigNumber(props.secondaryAsset.denom, props.secondaryAmount),
    ],
    props.displayCurrency,
    prices,
  )

  const showPrimaryText = !props.primaryAmount.isZero()
  const showSecondaryText = !props.secondaryAmount.isZero()

  return (
    <>
      {showPrimaryText && primaryText}
      {showPrimaryText && showSecondaryText && ' + '}
      {showSecondaryText && secondaryText}
      {(showPrimaryText || showSecondaryText) && (
        <DisplayCurrency
          className='before:content-["="] before:pr-1 ml-1 indent-10 inline'
          coin={new BNCoin({ denom: props.displayCurrency, amount: positionValue.toString() })}
        />
      )}
    </>
  )
}
