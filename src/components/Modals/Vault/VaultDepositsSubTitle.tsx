import BigNumber from 'bignumber.js'

import DisplayCurrency from 'components/DisplayCurrency'
import usePrice from 'hooks/usePrice'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { formatAmountWithSymbol } from 'utils/formatters'

interface Props {
  primaryAmount: BigNumber
  secondaryAmount: BigNumber
  primaryAsset: Asset
  secondaryAsset: Asset
}

export default function VaultDepositSubTitle(props: Props) {
  const baseCurrency = useStore((s) => s.baseCurrency)
  const primaryPrice = usePrice(props.primaryAsset.denom)
  const secondaryPrice = usePrice(props.secondaryAsset.denom)
  const primaryText = formatAmountWithSymbol({
    denom: props.primaryAsset.denom,
    amount: props.primaryAmount.toString(),
  })
  const secondaryText = formatAmountWithSymbol({
    denom: props.secondaryAsset.denom,
    amount: props.secondaryAmount.toString(),
  })

  const positionValue = props.primaryAmount
    .times(primaryPrice)
    .plus(props.secondaryAmount.times(secondaryPrice))
    .toNumber()

  const showPrimaryText = !props.primaryAmount.isZero()
  const showSecondaryText = !props.secondaryAmount.isZero()

  return (
    <>
      {showPrimaryText && primaryText}
      {showPrimaryText && showSecondaryText && ' + '}
      {showSecondaryText && secondaryText}
      {(showPrimaryText || showSecondaryText) && (
        <>
          {` = `}
          <DisplayCurrency
            coin={new BNCoin({ denom: baseCurrency.denom, amount: positionValue.toString() })}
          />
        </>
      )}
    </>
  )
}
