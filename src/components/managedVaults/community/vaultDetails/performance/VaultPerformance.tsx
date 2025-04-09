import PerformanceCard from 'components/managedVaults/community/vaultDetails/performance/PerformanceCard'
import PerformanceChart from 'components/managedVaults/community/vaultDetails/performance/chart/PerformanceChart'
import UserMetrics from 'components/managedVaults/community/vaultDetails/performance/UserMetrics'
import useStore from 'store'
import classNames from 'classnames'
interface Props {
  vaultAddress: string
  vaultDetails: ExtendedManagedVaultDetails
}

export default function VaultPerformance(props: Props) {
  const { vaultDetails, vaultAddress } = props
  const focusComponent = useStore((s) => s.focusComponent)

  return (
    <div className={classNames(focusComponent ? 'mx-20 min-h-200' : '')}>
      <div className='flex flex-wrap gap-4'>
        <UserMetrics />
        <PerformanceCard vaultDetails={vaultDetails} />
        <PerformanceChart />
      </div>
    </div>
  )
}
