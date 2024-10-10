import classNames from 'classnames'
import { useMemo } from 'react'

import DisplayCurrency from 'components/common/DisplayCurrency'
import Text from 'components/common/Text'
import { ORACLE_DENOM } from 'constants/oracle'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import { BNCoin } from 'types/classes/BNCoin'
import { formatAmountWithSymbol } from 'utils/formatters'
import { getValueFromBNCoins } from 'utils/helpers'

interface Props {
  primaryAmount: BigNumber
  secondaryAmount: BigNumber
  primaryAsset: Asset
  secondaryAsset: Asset
  displayCurrency: string
}

export default function FarmDepositsSubTitle(props: Props) {
  const assets = useDepositEnabledAssets()
  const primaryText = useMemo(
    () => (
      <Text size='xs' className='inline mt-1 text-white/60'>
        {formatAmountWithSymbol(
          {
            denom: props.primaryAsset.denom,
            amount: props.primaryAmount.toString(),
          },
          assets,
        )}
      </Text>
    ),
    [assets, props.primaryAmount, props.primaryAsset.denom],
  )

  const secondaryText = useMemo(
    () => (
      <Text size='xs' className='inline mt-1 text-white/60 ml-1 before:pr-1 before:content-["+"]'>
        {formatAmountWithSymbol(
          {
            denom: props.secondaryAsset.denom,
            amount: props.secondaryAmount.toString(),
          },
          assets,
        )}
      </Text>
    ),
    [assets, props.secondaryAmount, props.secondaryAsset.denom],
  )

  const positionValue = getValueFromBNCoins(
    [
      BNCoin.fromDenomAndBigNumber(props.primaryAsset.denom, props.primaryAmount),
      BNCoin.fromDenomAndBigNumber(props.secondaryAsset.denom, props.secondaryAmount),
    ],
    assets,
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
