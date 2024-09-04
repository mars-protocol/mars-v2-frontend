import ActionButton from 'components/common/Button/ActionButton'
import { ArrowRight, CrossCircled, Flag, Plus, TrashBin } from 'components/common/Icons'
import Loading from 'components/common/Loading'
import { AlertDialogItems } from 'components/Modals/AlertDialog/AlertDialogItems'
import { LocalStorageKeys } from 'constants/localStorageKeys'
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
    LocalStorageKeys.VAULT_COMMUNITY_WARNING,
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
    })
  }, [close, showAlertDialog, showVaultWarning, setShowVaultWarning])

  if (isLoading) return <Loading />

  return (
    <div className='flex items-center justify-end'>
      <ActionButton
        onClick={handleOnClick}
        color='tertiary'
        text='Details'
        leftIcon={<Plus />}
        short
      />
    </div>
  )
}

const INFO_ITEMS = [
  {
    icon: <CrossCircled />,
    title: 'Community vaults are not moderated ',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum arcu enim, cursus vel nulla quis, euismod molestie est.',
  },
  {
    icon: <Flag />,
    title: 'Your funds may be at risk',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum arcu enim, cursus vel nulla quis, euismod molestie est.',
  },
  {
    icon: <TrashBin />,
    title: 'Lorem ipsum dolor sit amet',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum arcu enim, cursus vel nulla quis, euismod molestie est.',
  },
]
