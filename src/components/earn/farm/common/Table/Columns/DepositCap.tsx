import { Row } from '@tanstack/react-table'

import DepositCapCell from 'components/common/DepositCapCell'
import Loading from 'components/common/Loading'
import Text from 'components/common/Text'

export const DEPOSIT_CAP_META = {
  accessorKey: 'cap',
  header: () => (
    <div className='flex flex-col text-xs leading-tight'>
      <Text size='xs'>Deposits</Text>
      <Text size='xs' className='text-white/40'>
        Deposit Cap
      </Text>
    </div>
  ),
  meta: { className: 'w-35' },
}

interface Props {
  vault: Vault | DepositedVault | PerpsVault | AstroLp | DepositedAstroLp
  isLoading?: boolean
}

export const depositCapSortingFn = (
  a: Row<Vault> | Row<DepositedVault> | Row<PerpsVault> | Row<AstroLp> | Row<DepositedAstroLp>,
  b: Row<Vault> | Row<DepositedVault> | Row<PerpsVault> | Row<AstroLp> | Row<DepositedAstroLp>,
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
