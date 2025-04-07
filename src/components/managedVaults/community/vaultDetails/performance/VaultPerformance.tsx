import PerformanceCard from 'components/managedVaults/community/vaultDetails/performance/PerformanceCard'
import PerformanceChart from './chart/PerformanceChart'

interface Props {
  vaultAddress: string
  vaultDetails: ExtendedManagedVaultDetails
}

export default function VaultPerformance(props: Props) {
  const { vaultDetails, vaultAddress } = props

  return (
    <section className='flex flex-col gap-4'>
      <div className='flex flex-wrap md:flex-nowrap items-center justify-center gap-2'>
        <PerformanceCard vaultDetails={vaultDetails} />
      </div>
      <PerformanceChart />
    </section>
  )
}
