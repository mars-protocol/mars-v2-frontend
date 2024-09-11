import { Row } from '@tanstack/react-table'
import classNames from 'classnames'

import { ORACLE_DENOM } from '../../../../constants/oracle'
import { BNCoin } from '../../../../types/classes/BNCoin'
import { BN } from '../../../../utils/helpers'
import DisplayCurrency from '../../../common/DisplayCurrency'
import { getAmountChangeColor } from '../functions'

export const VALUE_META = { accessorKey: 'value', header: 'Value' }

interface Props {
  amountChange: BigNumber
  value: string
  type: PositionType
}

export const valueBalancesSortingFn = (
  a: Row<AccountBalanceRow>,
  b: Row<AccountBalanceRow>,
): number => {
  const valueA = BN(a.original.value)
  const valueB = BN(b.original.value)
  return valueA.minus(valueB).toNumber()
}

export const valuePerpSortingFn = (a: Row<AccountPerpRow>, b: Row<AccountPerpRow>): number => {
  const valueA = BN(a.original.value)
  const valueB = BN(b.original.value)
  return valueA.minus(valueB).toNumber()
}

export default function Value(props: Props) {
  const { amountChange, type, value } = props
  const color = getAmountChangeColor(type, amountChange)
  const coin = new BNCoin({
    denom: ORACLE_DENOM,
    amount: value,
  })

  return (
    <DisplayCurrency coin={coin} className={classNames('text-xs text-right', color)} showZero />
  )
}
