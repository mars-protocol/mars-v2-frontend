import PerformanceCard from 'components/managedVaults/community/vaultDetails/performance/PerformanceCard'
import PerformanceChart from 'components/managedVaults/community/vaultDetails/performance/chart/PerformanceChart'
import UserMetrics from 'components/managedVaults/community/vaultDetails/performance/UserMetrics'
import useStore from 'store'
import classNames from 'classnames'
import { BN } from 'utils/helpers'
import { useManagedVaultUserShares } from 'hooks/managedVaults/useManagedVaultUserShares'

interface Props {
  vaultAddress: string
  vaultDetails: ExtendedManagedVaultDetails
}

export default function VaultPerformance(props: Props) {
  const { vaultDetails, vaultAddress } = props
  const focusComponent = useStore((s) => s.focusComponent)
  const address = useStore((s) => s.address)
  const { amount: userVaultShares } = useManagedVaultUserShares(
    address,
    vaultDetails.vault_tokens_denom,
    vaultAddress,
  )

  const hasPosition = BN(userVaultShares).isGreaterThan(0)

  return (
    <div className={classNames(focusComponent ? 'mx-20 min-h-200' : '')}>
      <div className='flex flex-wrap gap-4'>
        {hasPosition && <UserMetrics vaultAddress={vaultAddress} vaultDetails={vaultDetails} />}
        <PerformanceCard vaultDetails={vaultDetails} />
        <PerformanceChart />
      </div>
    </div>
  )
}
