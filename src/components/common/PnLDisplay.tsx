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
  inlinePercentage?: boolean
}

export default function PnLDisplay({
  pnlAmount,
  pnlPercentage,
  baseDenom,
  className,
  showPrefix = true,
  inlinePercentage = false,
}: Props) {
  const isProfitable = pnlAmount.isGreaterThan(0)
  const colorClass = isProfitable
    ? 'number text-success text-profit'
    : 'number text-error-loss text-loss'

  const formattedPercentage = `${isProfitable ? '+' : '-'}${formatPercent(pnlPercentage.abs().toNumber())}`

  const percentageDisplay = (
    <span className={classNames('text-xs', colorClass)}>({formattedPercentage})</span>
  )

  return (
    <div
      className={classNames(
        'flex items-end',
        inlinePercentage ? 'flex-row gap-1' : 'flex-col',
        className,
      )}
    >
      <DisplayCurrency
        coin={BNCoin.fromDenomAndBigNumber(baseDenom, pnlAmount)}
        className={colorClass}
        showSignPrefix={showPrefix}
        isProfitOrLoss
      />
      {percentageDisplay}
    </div>
  )
}
