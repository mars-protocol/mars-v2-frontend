import { FormattedNumber } from 'components/common/FormattedNumber'
import Loading from 'components/common/Loading'
import Text from 'components/common/Text'

export const APY_META = { accessorKey: 'apy', header: 'APY' }

interface Props {
  vault: Vault | DepositedVault | any //get the right ts
}

export default function Apy(props: Props) {
  const { vault } = props

  if (vault.apy === undefined) return <Loading />
  if (vault.apy === null) return <Text size='xs'>N/A</Text>

  return (
    <FormattedNumber
      amount={vault.apy ?? 0}
      options={{ minDecimals: 2, maxDecimals: 2, suffix: '%' }}
      className='text-xs'
      animate
    />
  )
}
