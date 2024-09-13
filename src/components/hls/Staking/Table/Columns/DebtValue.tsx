import { Row } from '@tanstack/react-table'

import DisplayCurrency from 'components/common/DisplayCurrency'
import { BNCoin } from 'types/classes/BNCoin'

export const DEBT_VAL_META = { header: 'Debt Value', accessorKey: 'values.debt' }
interface Props {
  account: HlsAccountWithStrategy
}

export function debtValueSorting(
  a: Row<HlsAccountWithStrategy>,
  b: Row<HlsAccountWithStrategy>,
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
