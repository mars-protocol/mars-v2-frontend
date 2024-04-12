import { Row } from '@tanstack/react-table'

import DisplayCurrency from 'components/common/DisplayCurrency'
import { BNCoin } from 'types/classes/BNCoin'

export const NET_VAL_META = { header: 'Net Value', accessorKey: 'values.net' }
interface Props {
  account: HLSAccountWithStrategy
}

export function netValueSorting(
  a: Row<HLSAccountWithStrategy>,
  b: Row<HLSAccountWithStrategy>,
): number {
  return a.original.values.net.minus(b.original.values.net).toNumber()
}

export default function NetValue(props: Props) {
  return (
    <DisplayCurrency
      coin={BNCoin.fromDenomAndBigNumber('usd', props.account.values.net)}
      className='text-xs'
    />
  )
}
