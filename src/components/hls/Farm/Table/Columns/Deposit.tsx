import { useCallback, useMemo } from 'react'

import ActionButton from 'components/common/Button/ActionButton'
import { Plus } from 'components/common/Icons'
import { EMPTY_ACCOUNT_HLS } from 'constants/accounts'
import useStore from 'store'

interface Props {
  hlsFarm: HlsFarm
  openHlsInfoDialog: (continueCallback: () => void) => void
}

export const DEPOSIT_META = {
  accessorKey: 'deposit',
  enableSorting: false,
  header: '',
  meta: { className: 'w-30' },
}

export default function Deposit(props: Props) {
  const { hlsFarm, openHlsInfoDialog } = props
  const borrowAssetsDenoms = useMemo(() => [hlsFarm.borrowAsset.denom], [hlsFarm])

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
    openHlsInfoDialog(openHlsFarmModal)
  }, [openHlsFarmModal, openHlsInfoDialog])

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
