import PerformanceChart from 'components/managedVaults/vaultDetails/performance/chart/PerformanceChart'
import UserMetrics from 'components/managedVaults/vaultDetails/performance/UserMetrics'
import VaultMetricsCard from 'components/managedVaults/vaultDetails/performance/VaultMetricsCard'
import useStore from 'store'

interface Props {
  vaultAddress: string
  vaultDetails: ManagedVaultsData
}

export default function VaultPerformance(props: Props) {
  const { vaultDetails, vaultAddress } = props
  const address = useStore((s) => s.address)

  return (
    <div className='flex flex-col gap-6 w-full'>
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
  )
}
