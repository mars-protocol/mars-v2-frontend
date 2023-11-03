import { Row } from '@tanstack/react-table'
import classNames from 'classnames'

import { getAmountChangeColor } from 'components/Account/AccountBalancesTable/functions'
import DisplayCurrency from 'components/DisplayCurrency'
import { ORACLE_DENOM } from 'constants/oracle'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

export const VALUE_META = { accessorKey: 'value', header: 'Value' }

interface Props {
  amountChange: BigNumber
  value: string
  type: 'deposits' | 'borrowing' | 'lending' | 'vault'
}

export const valueSortingFn = (a: Row<AccountBalanceRow>, b: Row<AccountBalanceRow>): number => {
  const valueA = BN(a.original.value)
  const valueB = BN(b.original.value)
  return valueA.minus(valueB).toNumber()
}

export default function Value(props: Props) {
  const { amountChange, type, value } = props
  const color = getAmountChangeColor(type, amountChange)
  const allowZero = !amountChange.isZero()
  const coin = new BNCoin({
    denom: ORACLE_DENOM,
    amount: value,
  })

  return (
    <DisplayCurrency
      coin={coin}
      className={classNames('text-xs text-right', color)}
      showZero={!allowZero}
    />
  )
}
