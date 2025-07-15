import NavigateBackButton from 'components/managedVaults/NavigateBackButton'
import Tab from 'components/earn/Tab'
import Text from 'components/common/Text'
import useStore from 'store'
import VaultPerformance from 'components/managedVaults/vaultDetails/performance/VaultPerformance'
import VaultOverview from 'components/managedVaults/vaultDetails/overview/VaultOverview'
import { CircularProgress } from 'components/common/CircularProgress'
import { useManagedVaultDetails } from 'hooks/managedVaults/useManagedVaultDetails'
import { useParams, useSearchParams } from 'react-router-dom'
import { VAULT_DETAILS_TABS } from 'constants/pages'
import AlertDialog from 'components/common/AlertDialog'
import { AlertDialogItems } from 'components/Modals/AlertDialog/AlertDialogItems'
import { ArrowRight } from 'components/common/Icons'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { INFO_ITEMS } from 'constants/warningDialog'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { useCallback, useEffect, useState } from 'react'

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
  const [showVaultWarning, setShowVaultWarning] = useLocalStorage<boolean>(
    LocalStorageKeys.VAULT_PAGE_WARNING,
    true,
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const vaultAddress = propVaultAddress || urlVaultAddress

  const showDialog = useCallback(() => {
    if (!showVaultWarning) return
    setIsDialogOpen(true)
  }, [showVaultWarning])

  const handleDialogClose = () => {
    setIsDialogOpen(false)
  }

  const handleCancel = () => {
    setShowVaultWarning(true)
    setIsDialogOpen(false)
  }

  useEffect(() => {
    const vaultWarning = localStorage.getItem(LocalStorageKeys.VAULT_PAGE_WARNING)
    if (vaultWarning === null || vaultWarning === 'true') {
      showDialog()
    }
  }, [showDialog])

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
        {!focusComponent && <NavigateBackButton />}
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

      <AlertDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        title='Proceed with caution'
        content={<AlertDialogItems items={INFO_ITEMS} />}
        positiveButton={{
          text: 'Continue',
          icon: <ArrowRight />,
          onClick: handleDialogClose,
        }}
        negativeButton={{
          text: 'Cancel',
          onClick: handleCancel,
        }}
        checkbox={{
          text: "Don't show again",
          onClick: (isChecked: boolean) => setShowVaultWarning(!isChecked),
        }}
        modalClassName='!bg-info/20 max-w-modal-md'
        titleClassName='text-info'
      />
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
