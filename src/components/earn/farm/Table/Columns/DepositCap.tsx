import { Row } from '@tanstack/react-table'

import DepositCapCell from 'components/common/DepositCapCell'
import Loading from 'components/common/Loading'

export const DEPOSIT_CAP_META = {
  accessorKey: 'cap',
  header: 'Deposit Cap',
  meta: { className: 'min-w-35' },
}

interface Props {
  vault: Vault | DepositedVault | PerpsVault
  isLoading: boolean
}

export const depositCapSortingFn = (
  a: Row<Vault> | Row<DepositedVault> | Row<PerpsVault>,
  b: Row<Vault> | Row<DepositedVault> | Row<PerpsVault>,
): number => {
  const depositCapA = a.original.cap?.max
  const depositCapB = b.original.cap?.max
  if (!depositCapA || !depositCapB) return 0
  return depositCapA.minus(depositCapB).toNumber()
}

export default function DepositCap(props: Props) {
  const { vault } = props

  if (props.isLoading) return <Loading />

  if (!vault.cap) return null
  return <DepositCapCell depositCap={vault.cap} />
}
