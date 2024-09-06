import { FormattedNumber } from 'components/common/FormattedNumber'

export const LTV_MAX_META = {
  accessorKey: 'ltv.max',
  header: 'Max LTV',
  meta: { className: 'w-24' },
}

interface Props {
  vault: Vault | DepositedVault | AstroLp | DepositedAstroLp
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
