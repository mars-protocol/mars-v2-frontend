import Loading from 'components/common/Loading'
import TierLabel from 'components/staking/TierLabel'
import { useStakedMars } from 'hooks/staking/useNeutronStakingData'
import { useMemo } from 'react'

interface Props {
  vault: ManagedVaultWithDetails
}

export const ACTIVE_BENEFITS_META = {
  id: 'activeBenefits',
  header: 'Active Benefits',
  accessorKey: 'activeBenefits',
  meta: {
    className: 'w-36',
  },
}

export default function ActiveBenefits({ vault }: Props) {
  const { data: stakedMarsData } = useStakedMars(vault.ownerAddress)

  const stakedAmount = useMemo(
    () => (!vault.ownerAddress ? 0 : stakedMarsData?.stakedAmount?.toNumber() || 0),
    [vault.ownerAddress, stakedMarsData],
  )
  if (!vault.ownerAddress) return <Loading className='w-16 h-6 justify-self-end' />

  return <TierLabel amount={stakedAmount} withTooltip wrapperClassName='justify-end' />
}
