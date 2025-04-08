import PerformanceCard from 'components/managedVaults/community/vaultDetails/performance/PerformanceCard'
import PerformanceChart from 'components/managedVaults/community/vaultDetails/performance/chart/PerformanceChart'
import UserMetrics from 'components/managedVaults/community/vaultDetails/performance/UserMetrics'

interface Props {
  vaultAddress: string
  vaultDetails: ExtendedManagedVaultDetails
}

export default function VaultPerformance(props: Props) {
  const { vaultDetails, vaultAddress } = props

  return (
    <div className='flex flex-col justify-center gap-4 md:flex-row min-h-[800px] h-full'>
      <div className='md:w-280 mx-auto h-full'>
        <div className='relative flex flex-wrap justify-center w-full gap-4'>
          <UserMetrics />
          <div className='flex flex-wrap md:flex-nowrap items-center justify-center gap-2 w-full'>
            <PerformanceCard vaultDetails={vaultDetails} />
          </div>
          <PerformanceChart />
        </div>
      </div>
    </div>
  )
}
