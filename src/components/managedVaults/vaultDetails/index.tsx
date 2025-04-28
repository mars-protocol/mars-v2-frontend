import NavigationBackButton from 'components/common/Button/NavigationBackButton'
import Tab from 'components/earn/Tab'
import Text from 'components/common/Text'
import useStore from 'store'
import VaultPerformance from 'components/managedVaults/vaultDetails/performance/VaultPerformance'
import VaultOverview from 'components/managedVaults/vaultDetails/overview/VaultOverview'
import { CircularProgress } from 'components/common/CircularProgress'
import { useManagedVaultDetails } from 'hooks/managedVaults/useManagedVaultDetails'
import { useParams, useSearchParams } from 'react-router-dom'
import { VAULT_DETAILS_TABS } from 'constants/pages'

function VaultLoadingState() {
  return (
    <div className='flex flex-wrap justify-center w-full gap-4'>
      <CircularProgress size={60} />
      <Text className='w-full text-center' size='2xl'>
        Fetching on-chain data...
      </Text>
    </div>
  )
}

interface Props {
  vaultAddress?: string
}

export default function VaultDetails(props: Props) {
  const { vaultAddress: propVaultAddress } = props
  const { vaultAddress: urlVaultAddress } = useParams<{ vaultAddress: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTabIdx = searchParams.get('tab') === 'performance' ? 1 : 0
  const focusComponent = useStore((s) => s.focusComponent)

  const vaultAddress = propVaultAddress || urlVaultAddress

  const handleTabChange = (index: number) => {
    const newParams = new URLSearchParams(searchParams)
    if (index === 1) {
      newParams.set('tab', 'performance')
    } else {
      newParams.delete('tab')
    }
    setSearchParams(newParams)
  }

  if (!vaultAddress) return <VaultLoadingState />

  return (
    <section className='container mx-auto'>
      <div className='flex mb-6 w-full'>
        {!focusComponent && <NavigationBackButton />}
        <div className='ml-auto'>
          <Tab
            tabs={VAULT_DETAILS_TABS}
            activeTabIdx={activeTabIdx}
            onTabChange={handleTabChange}
            disableNavigation
          />
        </div>
      </div>
      <VaultDetailsContent vaultAddress={vaultAddress} activeTabIdx={activeTabIdx} />
    </section>
  )
}

export function VaultDetailsContent({
  vaultAddress,
  activeTabIdx,
}: {
  vaultAddress: string
  activeTabIdx: number
}) {
  const { details: vaultDetails, isOwner, isLoading } = useManagedVaultDetails(vaultAddress)

  if (isOwner === undefined || !vaultDetails || isLoading) {
    return <VaultLoadingState />
  }

  if (!vaultDetails) return null

  return (
    <>
      {activeTabIdx === 0 ? (
        <VaultOverview vaultDetails={vaultDetails} isOwner={isOwner} vaultAddress={vaultAddress} />
      ) : (
        <VaultPerformance vaultDetails={vaultDetails} vaultAddress={vaultAddress} />
      )}
    </>
  )
}
