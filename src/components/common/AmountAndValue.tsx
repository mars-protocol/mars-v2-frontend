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
  layout?: 'vertical' | 'horizontal'
}

export default function AmountAndValue(props: Props) {
  const {
    asset,
    amount,
    changePercentage,
    isApproximation,
    abbreviated,
    priceOverride,
    layout = 'vertical',
  } = props
  const newAmount = demagnify(amount.toString(), asset)
  const isZero = newAmount === 0
  const isBelowMinAmount = newAmount < MIN_AMOUNT
  const displayAmount = isBelowMinAmount ? MIN_AMOUNT : newAmount
  return (
    <div
      className={classNames(
        'flex text-xs',
        layout === 'vertical'
          ? 'flex-col gap-[0.5] text-right items-end'
          : 'flex-row items-center gap-1.5 [&>div]:before:content-["|"] [&>div]:before:mx-0.5 [&>div]:before:text-white/10',
      )}
    >
      <DisplayCurrency
        className=''
        coin={BNCoin.fromDenomAndBigNumber(
          priceOverride ? 'usd' : asset.denom,
          priceOverride ? amount.times(priceOverride).shiftedBy(-asset.decimals) : amount,
        )}
        isApproximation={isApproximation}
        options={{ abbreviated: abbreviated ?? true }}
      />
      <div className={classNames('flex', layout === 'horizontal' && 'items-center gap-2')}>
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
        <FormattedNumber
          className='justify-end text-xs text-white/50'
          amount={isZero ? 0 : displayAmount}
          smallerThanThreshold={!isZero && isBelowMinAmount}
          options={{ abbreviated: abbreviated ?? true, maxDecimals: MAX_AMOUNT_DECIMALS }}
        />
      </div>
    </div>
  )
}
