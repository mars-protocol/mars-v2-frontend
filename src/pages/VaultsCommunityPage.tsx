import Tab from 'components/earn/Tab'
import VaultsCommunityIntro from 'components/vaults/community/VaultsCommunityIntro'
import useAlertDialog from 'hooks/common/useAlertDialog'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { VAUTLS_TABS } from 'constants/pages'
import { AvailableCommunityVaults } from 'components/vaults/community/table/AvailableCommunityVaults'
import { ArrowRight } from 'components/common/Icons'
import { AlertDialogItems } from 'components/Modals/AlertDialog/AlertDialogItems'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { useCallback, useEffect } from 'react'
import { INFO_ITEMS } from 'constants/warningDialog'

export default function VaultsCommunityPage() {
  const [showVaultWarning, setShowVaultWarning] = useLocalStorage<boolean>(
    LocalStorageKeys.VAULT_PAGE_WARNING,
    true,
  )
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

  return (
    <div className='flex flex-wrap w-full gap-6'>
      <Tab tabs={VAUTLS_TABS} activeTabIdx={1} />
      <VaultsCommunityIntro />
      <AvailableCommunityVaults />
    </div>
  )
}
