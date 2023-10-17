import React from 'react'

import AmountAndValue from 'components/AmountAndValue'
import { BN_ZERO } from 'constants/math'
import { BN } from 'utils/helpers'

export const DEPOSIT_VALUE_META = { accessorKey: 'accountDepositValue', header: 'Deposited' }

interface Props {
  asset: Asset
  lentAmount?: string
}
export default function DepositValue(props: Props) {
  return (
    <AmountAndValue
      asset={props.asset}
      amount={props.lentAmount ? BN(props.lentAmount) : BN_ZERO}
    />
  )
}
