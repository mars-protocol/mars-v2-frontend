import classNames from 'classnames'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { MAX_AMOUNT_DECIMALS, MIN_AMOUNT } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { demagnify } from 'utils/formatters'

interface Props {
  asset: Asset
  amount: BigNumber
  changePercentage?: BigNumber
  isApproximation?: boolean
  abbreviated?: boolean
  priceOverride?: BigNumber
}

export default function AmountAndValue(props: Props) {
  const { asset, amount, changePercentage, isApproximation, abbreviated, priceOverride } = props
  const newAmount = demagnify(amount.toString(), asset)
  const isZero = newAmount === 0
  const isBelowMinAmount = newAmount < MIN_AMOUNT
  const displayAmount = isBelowMinAmount ? MIN_AMOUNT : newAmount
  return (
    <div className='flex flex-col gap-[0.5] text-xs text-right items-end'>
      <FormattedNumber
        amount={isZero ? 0 : displayAmount}
        smallerThanThreshold={!isZero && isBelowMinAmount}
        options={{ abbreviated: abbreviated ?? true, maxDecimals: MAX_AMOUNT_DECIMALS }}
      />
      <div className='flex'>
        {changePercentage && (
          <FormattedNumber
            amount={changePercentage.toNumber()}
            className={classNames(
              changePercentage.isNegative() ? 'text-loss' : 'text-profit',
              'mx-1',
            )}
            parentheses
            options={{
              suffix: '%',
              prefix: changePercentage.isNegative() ? '' : '+',
              abbreviated: abbreviated ?? true,
            }}
          />
        )}
        <DisplayCurrency
          className='justify-end text-xs text-white/50'
          coin={BNCoin.fromDenomAndBigNumber(
            priceOverride ? 'usd' : asset.denom,
            priceOverride ? amount.times(priceOverride).shiftedBy(-asset.decimals) : amount,
          )}
          isApproximation={isApproximation}
          options={{ abbreviated: abbreviated ?? true }}
        />
      </div>
    </div>
  )
}
