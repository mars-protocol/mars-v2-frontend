import { Row } from '@tanstack/react-table'

import { BNCoin } from '../../../../../types/classes/BNCoin'
import DisplayCurrency from '../../../../common/DisplayCurrency'

export const POS_VAL_META = { header: 'Pos. Value', accessorKey: 'values.total' }
interface Props {
  account: HlsAccountWithStakingStrategy
}

export function positionValueSorting(
  a: Row<HlsAccountWithStakingStrategy>,
  b: Row<HlsAccountWithStakingStrategy>,
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
