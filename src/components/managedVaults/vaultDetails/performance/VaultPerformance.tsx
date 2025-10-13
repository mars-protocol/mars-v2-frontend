import VaultMetricsCard from 'components/managedVaults/vaultDetails/performance/VaultMetricsCard'
import PerformanceChart from 'components/managedVaults/vaultDetails/performance/chart/PerformanceChart'
import UserMetrics from 'components/managedVaults/vaultDetails/performance/UserMetrics'
import useStore from 'store'
import classNames from 'classnames'

interface Props {
  vaultAddress: string
  vaultDetails: ManagedVaultsData
}

export default function VaultPerformance(props: Props) {
  const { vaultDetails, vaultAddress } = props
  const focusComponent = useStore((s) => s.focusComponent)
  const address = useStore((s) => s.address)

  return (
    <div className={classNames('w-full', focusComponent ? 'min-h-200' : '')}>
      <div className='flex flex-wrap gap-6'>
        {address && (
          <UserMetrics
            vaultAddress={vaultAddress}
            vaultDetails={vaultDetails}
            userAddress={address}
          />
        )}
        <VaultMetricsCard vaultDetails={vaultDetails} vaultAddress={vaultAddress} />
        <PerformanceChart vaultAddress={vaultAddress} />
      </div>
    </div>
  )
}
