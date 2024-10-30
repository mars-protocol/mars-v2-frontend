import { useCallback, useMemo } from 'react'

import ActionButton from 'components/common/Button/ActionButton'
import { ArrowRight, Plus } from 'components/common/Icons'
import { HLS_INFO_ITEMS } from 'components/hls/Staking/Table/Columns/Deposit'
import { AlertDialogItems } from 'components/Modals/AlertDialog/AlertDialogItems'
import { EMPTY_ACCOUNT_HLS } from 'constants/accounts'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useAlertDialog from 'hooks/common/useAlertDialog'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useStore from 'store'

interface Props {
  hlsFarm: HlsFarm
}

export const DEPOSIT_META = {
  accessorKey: 'deposit',
  enableSorting: false,
  header: '',
  meta: { className: 'w-30' },
}

export default function Deposit(props: Props) {
  const { hlsFarm } = props
  const borrowAssetsDenoms = useMemo(() => [hlsFarm.borrowAsset.denom], [hlsFarm])

  const [showHlsInfo, setShowHlsInfo] = useLocalStorage<boolean>(
    LocalStorageKeys.HLS_INFORMATION,
    true,
  )

  const { open: openAlertDialog, close } = useAlertDialog()

  const openHlsFarmModal = useCallback(() => {
    useStore.setState({
      farmModal: {
        farm: hlsFarm.farm,
        selectedBorrowDenoms: borrowAssetsDenoms,
        isCreate: true,
        account: EMPTY_ACCOUNT_HLS,
        maxLeverage: hlsFarm.maxLeverage,
        action: 'deposit',
        type: 'high_leverage',
      },
    })
  }, [borrowAssetsDenoms, hlsFarm.farm, hlsFarm.maxLeverage])

  const handleOnClick = useCallback(() => {
    if (!showHlsInfo) {
      openHlsFarmModal()
      return
    }

    openAlertDialog({
      title: 'Understanding Hls Positions',
      content: <AlertDialogItems items={HLS_INFO_ITEMS} />,
      positiveButton: {
        text: 'Continue',
        icon: <ArrowRight />,
        onClick: openHlsFarmModal,
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
  }, [close, openAlertDialog, openHlsFarmModal, setShowHlsInfo, showHlsInfo])

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
