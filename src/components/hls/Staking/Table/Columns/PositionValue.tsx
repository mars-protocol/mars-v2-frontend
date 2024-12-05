import { Row } from '@tanstack/react-table'

import DisplayCurrency from 'components/common/DisplayCurrency'
import { BNCoin } from 'types/classes/BNCoin'

export const POS_VAL_META = { header: 'Pos. Value', accessorKey: 'values.total' }
interface Props {
  account: HlsAccountWithStrategy
}

export function positionValueSorting(
  a: Row<HlsAccountWithStrategy>,
  b: Row<HlsAccountWithStrategy>,
): number {
  return a.original.values.total.minus(b.original.values.total).toNumber()
}

export default function PositionValue(props: Props) {
  return (
    <DisplayCurrency
      coin={BNCoin.fromDenomAndBigNumber('usd', props.account.values.total)}
      className='text-xs'
    />
  )
}
