import AlertDialog from 'components/common/AlertDialog'
import { CircularProgress } from 'components/common/CircularProgress'
import { ArrowRight } from 'components/common/Icons'
import Text from 'components/common/Text'
import Tab from 'components/earn/Tab'
import NavigateBackButton from 'components/managedVaults/NavigateBackButton'
import VaultOverview from 'components/managedVaults/vaultDetails/overview/VaultOverview'
import VaultPerformance from 'components/managedVaults/vaultDetails/performance/VaultPerformance'
import { AlertDialogItems } from 'components/Modals/AlertDialog/AlertDialogItems'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { VAULT_DETAILS_TABS } from 'constants/pages'
import { INFO_ITEMS } from 'constants/warningDialog'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { useManagedVaultDetails } from 'hooks/managedVaults/useManagedVaultDetails'
import { useCallback, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import useStore from 'store'

function VaultLoadingState() {
  return (
    <div className='flex flex-wrap justify-center w-full gap-4 mt-20'>
      <CircularProgress size={40} />
      <Text className='w-full text-center' size='xl'>
        Fetching vault data...
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
    <section className='container mx-auto flex flex-wrap w-full gap-2 py-8'>
      <div className='flex w-full'>
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
        modalClassName='border-martian-red/40! max-w-modal-md'
        titleClassName='text-martian-red'
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
