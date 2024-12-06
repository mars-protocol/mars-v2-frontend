import { useCallback } from 'react'

import ActionButton from 'components/common/Button/ActionButton'
import { ArrowRight, Circle, TrashBin, Wallet } from 'components/common/Icons'
import Loading from 'components/common/Loading'
import { AlertDialogItems } from 'components/Modals/AlertDialog/AlertDialogItems'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useAlertDialog from 'hooks/common/useAlertDialog'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useStore from 'store'

export const DEPOSIT_META = {
  accessorKey: 'deposit',
  header: '',
  enableSorting: false,
  meta: { className: 'w-30' },
}

interface Props {
  isLoading: boolean
  strategy?: HlsStrategy
  vault?: Vault
}

export default function Deposit(props: Props) {
  const { strategy, vault } = props

  const [showHlsInfo, setShowHlsInfo] = useLocalStorage<boolean>(
    LocalStorageKeys.HLS_INFORMATION,
    true,
  )

  const { open: openAlertDialog, close } = useAlertDialog()

  const openHlsModal = useCallback(() => {
    if (!strategy && !vault) return
    useStore.setState({ hlsModal: { strategy, vault } })
  }, [strategy, vault])

  const handleOnClick = useCallback(() => {
    if (!showHlsInfo) {
      openHlsModal()
      return
    }

    openAlertDialog({
      title: 'Understanding Hls Positions',
      content: <AlertDialogItems items={HLS_INFO_ITEMS} />,
      positiveButton: {
        text: 'Continue',
        icon: <ArrowRight />,
        onClick: openHlsModal,
      },
      negativeButton: {
        text: 'Cancel',
        onClick: () => {
          setShowHlsInfo(true)
          close()
        },
      },
      checkbox: {
        text: "Don't show again",
        onClick: (isChecked: boolean) => setShowHlsInfo(!isChecked),
      },
    })
  }, [close, openAlertDialog, openHlsModal, setShowHlsInfo, showHlsInfo])

  if (props.isLoading) return <Loading />

  return (
    <div className='flex items-center justify-end'>
      <ActionButton onClick={handleOnClick} color='tertiary' text='Deposit' short />
    </div>
  )
}

export const HLS_INFO_ITEMS = [
  {
    icon: <Circle />,
    title: 'One account, one position',
    description:
      'A minted Hls account can only have a single position tied to it, in order to limit risk.',
  },
  {
    icon: <Wallet />,
    title: 'Funded from your wallet',
    description: 'To fund your Hls position, funds will have to come directly from your wallet.',
  },
  {
    icon: <TrashBin />,
    title: 'Accounts are reusable',
    description:
      'If you exited a position from a minted account, this account can be reused for a new position.',
  },
]
