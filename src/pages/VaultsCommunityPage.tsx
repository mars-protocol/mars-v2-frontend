import { AlertDialogItems } from 'components/Modals/AlertDialog/AlertDialogItems'
import { ArrowRight } from 'components/common/Icons'
import VaultsCommunityIntro from 'components/managedVaults/VaultsCommunityIntro'
import AvailableCommunityVaults from 'components/managedVaults/table/AvailableCommunityVaults'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { INFO_ITEMS } from 'constants/warningDialog'
import useAccountId from 'hooks/accounts/useAccountId'
import useChainConfig from 'hooks/chain/useChainConfig'
import useAlertDialog from 'hooks/common/useAlertDialog'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useStore from 'store'
import { getPage, getRoute } from 'utils/route'

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

  useEffect(() => {
    if (!chainConfig.managedVaults) {
      navigate(getRoute(getPage('trade', chainConfig), searchParams, address, accountId))
    }
  }, [accountId, address, chainConfig, chainConfig.managedVaults, navigate, searchParams])

  const showDialog = useCallback(() => {
    if (!showVaultWarning) return

    showAlertDialog({
      title: 'Please be aware of the following',
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
      <VaultsCommunityIntro />
      <AvailableCommunityVaults />
    </div>
  )
}
