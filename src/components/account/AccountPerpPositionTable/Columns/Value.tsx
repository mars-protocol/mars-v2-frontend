import { Row } from '@tanstack/react-table'
import classNames from 'classnames'

import { getAmountChangeColor } from 'components/account/AccountBalancesTable/functions'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { ORACLE_DENOM } from 'constants/oracle'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

export const VALUE_META = { accessorKey: 'value', header: 'Value' }

interface Props {
  sizeChange: BigNumber
  value: string
  type: AccountType | 'perp'
}

export const valueSortingFn = (a: Row<AccountPerpRow>, b: Row<AccountPerpRow>): number => {
  const valueA = BN(a.original.value)
  const valueB = BN(b.original.value)
  return valueA.minus(valueB).toNumber()
}

export default function Value(props: Props) {
  const { sizeChange, type, value } = props
  const color = getAmountChangeColor(type, sizeChange)
  const coin = new BNCoin({
    denom: ORACLE_DENOM,
    amount: value,
  })

  return (
    <DisplayCurrency
      coin={coin}
      className={classNames('text-xs text-right', color)}
      showZero={true}
    />
  )
}
