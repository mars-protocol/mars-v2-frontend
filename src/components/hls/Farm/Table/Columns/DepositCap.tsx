import { Row } from '@tanstack/react-table'

import DepositCapCell from 'components/common/DepositCapCell'
import Loading from 'components/common/Loading'

export const DEPOSIT_CAP_META = {
  accessorKey: 'cap',
  header: 'Cap',
}

interface Props {
  farm: HlsFarm | DepositedHlsFarm
  isLoading?: boolean
}

export const depositCapSortingFn = (
  a: Row<HlsFarm> | Row<DepositedHlsFarm>,
  b: Row<HlsFarm> | Row<DepositedHlsFarm>,
): number => {
  const depositCapA = a.original.farm.cap?.max
  const depositCapB = b.original.farm.cap?.max
  if (!depositCapA || !depositCapB) return 0
  return depositCapA.minus(depositCapB).toNumber()
}

export default function DepositCap(props: Props) {
  const { farm } = props

  if (props.isLoading) return <Loading />

  if (!farm.farm.cap) return null
  return <DepositCapCell depositCap={farm.farm.cap} />
}
