import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useMemo } from 'react'

import DisplayCurrency from 'components/DisplayCurrency'
import Text from 'components/Text'
import usePrices from 'hooks/usePrices'
import { BNCoin } from 'types/classes/BNCoin'
import { formatAmountWithSymbol } from 'utils/formatters'
import { getValueFromBNCoins } from 'utils/helpers'
import { ORACLE_DENOM } from 'constants/oracle'

interface Props {
  primaryAmount: BigNumber
  secondaryAmount: BigNumber
  primaryAsset: Asset
  secondaryAsset: Asset
  displayCurrency: string
}

export default function VaultDepositSubTitle(props: Props) {
  const { data: prices } = usePrices()
  const primaryText = useMemo(
    () => (
      <Text size='xs' className='inline mt-1 text-white/60'>
        {formatAmountWithSymbol({
          denom: props.primaryAsset.denom,
          amount: props.primaryAmount.toString(),
        })}
      </Text>
    ),
    [props.primaryAmount, props.primaryAsset.denom],
  )

  const secondaryText = useMemo(
    () => (
      <Text size='xs' className='inline mt-1 text-white/60 ml-1 before:pr-1 before:content-["+"]'>
        {formatAmountWithSymbol({
          denom: props.secondaryAsset.denom,
          amount: props.secondaryAmount.toString(),
        })}
      </Text>
    ),
    [props.secondaryAmount, props.secondaryAsset.denom],
  )

  const positionValue = getValueFromBNCoins(
    [
      BNCoin.fromDenomAndBigNumber(props.primaryAsset.denom, props.primaryAmount),
      BNCoin.fromDenomAndBigNumber(props.secondaryAsset.denom, props.secondaryAmount),
    ],
    prices,
  )

  const showPrimaryText = !props.primaryAmount.isZero()
  const showSecondaryText = !props.secondaryAmount.isZero()

  return (
    <>
      {showPrimaryText && primaryText}
      {showSecondaryText && secondaryText}
      {(showPrimaryText || showSecondaryText) && (
        <DisplayCurrency
          className={classNames(
            'text-xs mt-1 text-white/60 ml-1 inline',
            'before:content-["="] before:pr-1',
          )}
          coin={new BNCoin({ denom: ORACLE_DENOM, amount: positionValue.toString() })}
        />
      )}
    </>
  )
}
