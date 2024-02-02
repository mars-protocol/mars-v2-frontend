import { FormattedNumber } from 'components/common/FormattedNumber'
import Loading from 'components/common/Loading'

export const APY_META = { accessorKey: 'apy', header: 'APY' }

interface Props {
  vault: Vault | DepositedVault
}

export default function Apy(props: Props) {
  const { vault } = props

  if (vault.apy === null) return <Loading />

  const realAPY = vault.apy && vault.apy > 100000 ? 100000 : vault.apy ?? 0
  return (
    <FormattedNumber
      amount={realAPY}
      options={{ minDecimals: 2, maxDecimals: 2, suffix: '%' }}
      className='text-xs'
      animate
    />
  )
}
