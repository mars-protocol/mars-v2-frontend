import { Row } from '@tanstack/react-table'

import DisplayCurrency from 'components/common/DisplayCurrency'
import { BNCoin } from 'types/classes/BNCoin'

export const NET_VAL_META = { header: 'Net Value', accessorKey: 'values.net' }
interface Props {
  netValue: BigNumber
}

export function netValueSorting(a: Row<DepositedHlsFarm>, b: Row<DepositedHlsFarm>): number {
  return a.original.netValue.minus(b.original.netValue).toNumber()
}

export default function NetValue(props: Props) {
  return (
    <DisplayCurrency
      coin={BNCoin.fromDenomAndBigNumber('usd', props.netValue)}
      className='text-xs'
    />
  )
}
