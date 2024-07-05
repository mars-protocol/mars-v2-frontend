import { FormattedNumber } from 'components/common/FormattedNumber'

export const LTV_MAX_META = {
  accessorKey: 'ltv.max',
  header: 'Max LTV',
  meta: { className: 'min-w-28' },
}

interface Props {
  vault: Vault | DepositedVault | Farm | DepositedFarm
}
export default function MaxLtv(props: Props) {
  const { vault } = props
  return (
    <FormattedNumber
      amount={vault.ltv.max * 100}
      options={{ minDecimals: 0, maxDecimals: 0, suffix: '%' }}
      className='text-xs'
      animate
    />
  )
}
