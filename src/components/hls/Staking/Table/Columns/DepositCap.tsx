import { Row } from '@tanstack/react-table'

import DepositCapCell from '../../../../common/DepositCapCell'

export const CAP_META = { header: 'Cap', accessorKey: 'strategy.depositCap' }

export const depositCapSortingFn = (
  a: Row<HlsAccountWithStakingStrategy>,
  b: Row<HlsAccountWithStakingStrategy>,
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
