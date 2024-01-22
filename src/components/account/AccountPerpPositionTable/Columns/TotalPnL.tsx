import classNames from 'classnames'

import DisplayCurrency from 'components/common/DisplayCurrency'
import usePrice from 'hooks/usePrice'
import { BNCoin } from 'types/classes/BNCoin'

export const PNL_META = { id: 'pnl', header: 'Total PnL', meta: { className: 'w-30' } }

interface Props {
  pnl: BNCoin
}

export default function TotalPnL(props: Props) {
  const { pnl } = props
  const price = usePrice(pnl.denom)
  const isNegative = pnl.amount.isLessThan(0)
  const isPositive = pnl.amount.isGreaterThan(0)

  return (
    <DisplayCurrency
      className={classNames(
        'text-xs text-right number',
        isNegative && 'text-loss',
        isPositive && 'text-profit',
      )}
      coin={pnl}
      options={{ abbreviated: false, prefix: isPositive ? '+' : isNegative ? '-' : '' }}
      showZero
    />
  )
}
