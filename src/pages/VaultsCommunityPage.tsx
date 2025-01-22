import { AlertDialogItems } from 'components/Modals/AlertDialog/AlertDialogItems'
import { ArrowRight } from 'components/common/Icons'
import { AvailableCommunityVaults } from 'components/vaults/community/table/AvailableCommunityVaults'
import { getPage, getRoute } from 'utils/route'
import { INFO_ITEMS } from 'constants/warningDialog'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useAccountId from 'hooks/accounts/useAccountId'
import useAlertDialog from 'hooks/common/useAlertDialog'
import { useCallback, useEffect } from 'react'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useStore from 'store'
import Tab from 'components/earn/Tab'
import VaultsCommunityIntro from 'components/vaults/community/VaultsCommunityIntro'
import { VAULTS_TABS } from 'constants/pages'
import useManagedVaults from 'hooks/managedVaults/useManagedVaults'

export default function VaultsCommunityPage() {
  const [showVaultWarning, setShowVaultWarning] = useLocalStorage<boolean>(
    LocalStorageKeys.VAULT_PAGE_WARNING,
    true,
  )
  const chainConfig = useChainConfig()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)
  const accountId = useAccountId()
  const { open: showAlertDialog, close } = useAlertDialog()

  const showDialog = useCallback(() => {
    if (!showVaultWarning) return

    showAlertDialog({
      title: "You're entering dangerous territory",
      content: <AlertDialogItems items={INFO_ITEMS} />,
      positiveButton: {
        text: 'Continue',
        icon: <ArrowRight />,
        onClick: () => {
          close()
        },
      },
      negativeButton: {
        text: 'Cancel',
        onClick: () => {
          setShowVaultWarning(true)
          close()
        },
      },
      checkbox: {
        text: "Don't show again",
        onClick: (isChecked: boolean) => setShowVaultWarning(!isChecked),
      },
      modalClassName: '!bg-info/20',
      titleClassName: 'text-info',
    })
  }, [close, showAlertDialog, showVaultWarning, setShowVaultWarning])

  useEffect(() => {
    const vaultWarning = localStorage.getItem(LocalStorageKeys.VAULT_PAGE_WARNING)
    if (vaultWarning === null || vaultWarning === 'true') {
      showDialog()
    }
  }, [showDialog])

  useEffect(() => {
    if (!chainConfig.managedVaults) {
      navigate(getRoute(getPage('trade', chainConfig), searchParams, address, accountId))
    }
  }, [accountId, address, chainConfig, chainConfig.managedVaults, navigate, searchParams])

  return (
    <div className='flex flex-wrap w-full gap-6'>
      <Tab tabs={VAULTS_TABS} activeTabIdx={1} />
      <VaultsCommunityIntro />
      <AvailableCommunityVaults />
    </div>
  )
}
