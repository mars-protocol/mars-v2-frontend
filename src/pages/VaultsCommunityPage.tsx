import { AlertDialogItems } from 'components/Modals/AlertDialog/AlertDialogItems'
import AlertDialog from 'components/common/AlertDialog'
import { ArrowRight } from 'components/common/Icons'
import Text from 'components/common/Text'
import { ActivePerpsVault } from 'components/earn/farm/perps/ActivePerpsVaults'
import AvailablePerpsVaultsTable from 'components/earn/farm/perps/Table/AvailablePerpsVaultTable'
import VaultsIntro from 'components/managedVaults/VaultsIntro'
import AvailableCommunityVaults from 'components/managedVaults/table/AvailableCommunityVaults'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { INFO_ITEMS } from 'constants/warningDialog'
import useAccountId from 'hooks/accounts/useAccountId'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useDepositedVaults from 'hooks/vaults/useDepositedVaults'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useStore from 'store'
import { VaultStatus } from 'types/enums'
import { getPage, getRoute } from 'utils/route'

export default function VaultsCommunityPage() {
  const [showVaultWarning, setShowVaultWarning] = useLocalStorage<boolean>(
    LocalStorageKeys.VAULT_PAGE_WARNING,
    true,
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const chainConfig = useChainConfig()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)
  const accountId = useAccountId()
  const account = useCurrentAccount()
  const { data: depositedVaults } = useDepositedVaults(account?.id ?? '')

  const activePerpsVaults = useMemo(() => {
    return depositedVaults.filter((vault) => vault.status === VaultStatus.ACTIVE).length
  }, [depositedVaults])

  const hasPerpsVault = chainConfig.perps

  useEffect(() => {
    if (!chainConfig.managedVaults) {
      navigate(getRoute(getPage('trade', chainConfig), searchParams, address, accountId))
    }
  }, [accountId, address, chainConfig, chainConfig.managedVaults, navigate, searchParams])

  const showDialog = useCallback(() => {
    if (!showVaultWarning) return
    setIsDialogOpen(true)
  }, [showVaultWarning])

  const handleDialogClose = () => {
    setIsDialogOpen(false)
  }

  const handleContinue = () => {
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

  return (
    <div className='flex flex-col w-full gap-2 py-8'>
      <VaultsIntro hasPerpsVault={hasPerpsVault} />

      {/* Perps Vault Section */}
      {hasPerpsVault && (
        <div className='w-full mt-6'>
          <Text size='2xl' className='mb-4 text-white'>
            Counterparty Vault
          </Text>
          <ActivePerpsVault />
          {activePerpsVaults === 0 && <AvailablePerpsVaultsTable />}
        </div>
      )}

      {/* Community Vaults Section */}
      <div className='w-full mt-6'>
        <AvailableCommunityVaults />
      </div>

      <AlertDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        title='Please be aware of the following'
        content={<AlertDialogItems items={INFO_ITEMS} />}
        positiveButton={{
          text: 'Continue',
          icon: <ArrowRight />,
          onClick: handleContinue,
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
    </div>
  )
}
