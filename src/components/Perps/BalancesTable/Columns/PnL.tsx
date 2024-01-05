import classNames from 'classnames'

import DisplayCurrency from 'components/DisplayCurrency'
import { BNCoin } from 'types/classes/BNCoin'

export const PNL_META = { accessorKey: 'pnl', header: 'Total PnL', id: 'pnl' }

type Props = {
  pnl: BNCoin
}

export default function PnL(props: Props) {
  const isNegative = props.pnl.amount.isNegative()
  return (
    <span
      className={classNames(
        'text-xs',
        isNegative ? 'text-error' : props.pnl.amount.isZero() ? '' : 'text-success',
      )}
    >
      {isNegative ? '-' : props.pnl.amount.isZero() ? '' : '+'}
      <DisplayCurrency
        className='inline'
        coin={BNCoin.fromDenomAndBigNumber(props.pnl.denom, props.pnl.amount.abs())}
      />
    </span>
  )
}
