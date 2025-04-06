import NavigationBackButton from 'components/common/Button/NavigationBackButton'
import Tab from 'components/earn/Tab'
import Text from 'components/common/Text'
import VaultHistoricalData from 'components/managedVaults/community/vaultDetails/VaultHistoricalData'
import VaultOverview from 'components/managedVaults/community/vaultDetails/VaultOverview'
import { CircularProgress } from 'components/common/CircularProgress'
import { useManagedVaultDetails } from 'hooks/managedVaults/useManagedVaultDetails'
import { useParams } from 'react-router-dom'
import { useState } from 'react'
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

export default function VaultDetails() {
  const { vaultAddress } = useParams<{ vaultAddress: string }>()

  if (!vaultAddress) return <VaultLoadingState />

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
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0)

  if (isOwner === undefined || !vaultDetails || isLoading) {
    return <VaultLoadingState />
  }

  if (!vaultDetails) return null

  return (
    <div className='flex flex-col gap-4'>
      <Tab
        tabs={VAULT_DETAILS_TABS}
        activeTabIdx={activeTabIdx}
        onTabChange={setActiveTabIdx}
        disableNavigation
        className='flex justify-end'
      />
      {activeTabIdx === 0 ? (
        <VaultOverview vaultDetails={vaultDetails} isOwner={isOwner} vaultAddress={vaultAddress} />
      ) : (
        <VaultHistoricalData vaultAddress={vaultAddress} />
      )}
    </div>
  )
}
