import Button from 'components/common/Button'
import { ArrowRight } from 'components/common/Icons'
import Loading from 'components/common/Loading'
import { AlertDialogItems } from 'components/Modals/AlertDialog/AlertDialogItems'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { INFO_ITEMS } from 'constants/warningDialog'
import useAlertDialog from 'hooks/common/useAlertDialog'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { useCallback } from 'react'

export const DETAILS_META = {
  accessorKey: 'details',
  header: '',
  enableSorting: false,
  meta: { className: 'w-40' },
}

interface Props {
  isLoading: boolean
}

export default function Details(props: Props) {
  const { isLoading } = props

  const [showVaultWarning, setShowVaultWarning] = useLocalStorage<boolean>(
    LocalStorageKeys.VAULT_DEPOSIT_WARNING,
    true,
  )

  const { open: showAlertDialog, close } = useAlertDialog()

  const handleOnClick = useCallback(() => {
    if (!showVaultWarning) {
      // TODO
      // opencommunitymodal
      return
    }

    showAlertDialog({
      title: 'Proceed with caution',
      content: <AlertDialogItems items={INFO_ITEMS} />,
      positiveButton: {
        text: 'Continue',
        icon: <ArrowRight />,
        onClick: () => {},
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

  if (isLoading) return <Loading />

  return (
    <div className='flex items-center justify-end'>
      <Button onClick={handleOnClick} color='tertiary' text='Details' />
    </div>
  )
}
