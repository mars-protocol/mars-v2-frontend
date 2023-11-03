import { Row } from '@tanstack/react-table'

import DisplayCurrency from 'components/DisplayCurrency'
import { BNCoin } from 'types/classes/BNCoin'

export const DEBT_VAL_META = { header: 'Debt Value', accessorKey: 'values.debt' }
interface Props {
  account: HLSAccountWithStrategy
}

export function debtValueSorting(
  a: Row<HLSAccountWithStrategy>,
  b: Row<HLSAccountWithStrategy>,
): number {
  return a.original.values.debt.minus(b.original.values.debt).toNumber()
}

export default function DebtValue(props: Props) {
  return (
    <DisplayCurrency
      coin={BNCoin.fromDenomAndBigNumber('usd', props.account.values.debt)}
      className='text-xs'
    />
  )
}
