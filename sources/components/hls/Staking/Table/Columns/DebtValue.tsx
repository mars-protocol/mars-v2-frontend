import { Row } from '@tanstack/react-table'

import { BNCoin } from '../../../../../types/classes/BNCoin'
import DisplayCurrency from '../../../../common/DisplayCurrency'

export const DEBT_VAL_META = { header: 'Debt Value', accessorKey: 'values.debt' }
interface Props {
  account: HlsAccountWithStakingStrategy
}

export function debtValueSorting(
  a: Row<HlsAccountWithStakingStrategy>,
  b: Row<HlsAccountWithStakingStrategy>,
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
