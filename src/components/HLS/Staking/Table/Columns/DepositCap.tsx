import { Row } from '@tanstack/react-table'
import React from 'react'

import DepositCapCell from 'components/DepositCapCell'

export const CAP_META = { header: 'Cap', accessorKey: 'strategy.depositCap' }

export const depositCapSortingFn = (
  a: Row<HLSAccountWithStrategy>,
  b: Row<HLSAccountWithStrategy>,
): number => {
  const depositCapA = a.original.strategy.depositCap.max
  const depositCapB = b.original.strategy.depositCap.max
  return depositCapA.minus(depositCapB).toNumber()
}

interface Props {
  account: HLSAccountWithStrategy
}

export default function Name(props: Props) {
  return <DepositCapCell depositCap={props.account.strategy.depositCap} />
}
