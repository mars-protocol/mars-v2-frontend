import NavigationBackButton from 'components/common/Button/NavigationBackButton'
import Text from 'components/common/Text'
import { CircularProgress } from 'components/common/CircularProgress'
import { useManagedVaultDetails } from 'hooks/managedVaults/useManagedVaultDetails'
import { useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import VaultOverview from 'components/managedVaults/community/vaultDetails/VaultOverview'
import VaultHistoricalData from 'components/managedVaults/community/vaultDetails/VaultHistoricalData'
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

export default function VaultDetails() {
  const { vaultAddress } = useParams<{ vaultAddress: string }>()

  if (!vaultAddress) {
    return <VaultLoadingState />
  }

  return (
    <div className='container mx-auto'>
      <div className='flex items-center mb-6'>
        <NavigationBackButton />
      </div>

      <VaultDetailsContent vaultAddress={vaultAddress} />
    </div>
  )
}

export function VaultDetailsContent({ vaultAddress }: { vaultAddress: string }) {
  const { details: vaultDetails, isOwner, isLoading } = useManagedVaultDetails(vaultAddress)

  const tabs = useMemo(() => {
    if (!vaultDetails) return []

    return [
      {
        title: 'Vault Overview',
        renderContent: () => (
          <VaultOverview
            vaultDetails={vaultDetails}
            isOwner={isOwner}
            vaultAddress={vaultAddress}
          />
        ),
      },
      {
        title: 'Historical Data',
        renderContent: () => <VaultHistoricalData />,
      },
    ]
  }, [vaultDetails, isOwner, vaultAddress])

  if (isOwner === undefined || !vaultDetails || isLoading) {
    return <VaultLoadingState />
  }

  if (!vaultDetails) return null

  return <CardWithTabs tabs={tabs} />
}
