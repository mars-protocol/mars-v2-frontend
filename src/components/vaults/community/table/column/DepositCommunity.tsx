import ActionButton from 'components/common/Button/ActionButton'
import { ArrowRight, Circle, Plus, TrashBin, Wallet } from 'components/common/Icons'
import Loading from 'components/common/Loading'
import { AlertDialogItems } from 'components/Modals/AlertDialog/AlertDialogItems'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useAlertDialog from 'hooks/common/useAlertDialog'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { useCallback } from 'react'

export const DEPOSIT_META = {
  accessorKey: 'deposit',
  header: '',
  enableSorting: false,
  meta: { className: 'min-w-20' },
}

interface Props {
  isLoading: boolean
}

export default function DepositCommunity(props: Props) {
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
        text='Deposit'
        leftIcon={<Plus />}
        short
      />
    </div>
  )
}

const INFO_ITEMS = [
  {
    icon: <Circle />,
    title: 'Community vaults are not moderated ',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum arcu enim, cursus vel nulla quis, euismod molestie est.',
  },
  {
    icon: <Wallet />,
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
