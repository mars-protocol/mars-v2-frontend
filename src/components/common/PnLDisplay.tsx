import DisplayCurrency from './DisplayCurrency'
import { BNCoin } from 'types/classes/BNCoin'
import { formatPercent } from 'utils/formatters'
import classNames from 'classnames'

interface Props {
  pnlAmount: BigNumber
  pnlPercentage: BigNumber
  baseDenom: string
  className?: string
  showPrefix?: boolean
}

export default function PnLDisplay({
  pnlAmount,
  pnlPercentage,
  baseDenom,
  className,
  showPrefix = true,
}: Props) {
  const isProfitable = pnlAmount.isGreaterThan(0)
  const colorClass = isProfitable
    ? 'number text-success text-profit'
    : 'number text-error-loss text-loss'

  return (
    <div className={classNames('flex flex-col items-end', className)}>
      <DisplayCurrency
        coin={BNCoin.fromDenomAndBigNumber(baseDenom, pnlAmount)}
        className={colorClass}
        showSignPrefix={showPrefix}
        isProfitOrLoss
      />
      <span className={classNames('text-xs', colorClass)}>
        (
        {showPrefix
          ? formatPercent(pnlPercentage.toNumber())
          : formatPercent(pnlPercentage.abs().toNumber())}
        )
      </span>
    </div>
  )
}
