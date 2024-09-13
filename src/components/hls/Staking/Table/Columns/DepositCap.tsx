import { Row } from '@tanstack/react-table'

import DepositCapCell from 'components/common/DepositCapCell'

export const CAP_META = { header: 'Cap', accessorKey: 'strategy.depositCap' }

export const depositCapSortingFn = (
  a: Row<HlsAccountWithStrategy>,
  b: Row<HlsAccountWithStrategy>,
): number => {
  const depositCapA = a.original.strategy.depositCap.max
  const depositCapB = b.original.strategy.depositCap.max
  return depositCapA.minus(depositCapB).toNumber()
}

interface Props {
  depositCap: DepositCap
}

export default function DepositCap(props: Props) {
  return <DepositCapCell depositCap={props.depositCap} />
}
