import { useCallback, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'

import { ACCOUNT_MENU_BUTTON_ID } from 'components/account/AccountMenuContent'
import AlertDialog from 'components/common/AlertDialog'
import DropDownButton from 'components/common/Button/DropDownButton'
import { ArrowDownLine, ArrowUpLine, Enter, ExclamationMarkCircled } from 'components/common/Icons'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useLendAndReclaimModal from 'hooks/common/useLendAndReclaimModal'
import useAutoLend from 'hooks/wallet/useAutoLend'
import useStore from 'store'

export const MANAGE_META = {
  accessorKey: 'manage',
  enableSorting: false,
  header: '',
  meta: {
    className: 'w-40',
  },
}

interface Props {
  data: LendingMarketTableData
}
export default function Manage(props: Props) {
  const { openLend, openReclaim } = useLendAndReclaimModal()
  const { isAutoLendEnabledForCurrentAccount } = useAutoLend()
  const [isAutoLendDialogOpen, setIsAutoLendDialogOpen] = useState(false)
  const address = useStore((s) => s.address)
  const account = useCurrentAccount()

  const hasAssetInDeposits = useMemo(
    () => !!account?.deposits?.find((deposit) => deposit.denom === props.data.asset.denom)?.amount,
    [account?.deposits, props.data.asset.denom],
  )

  const handleUnlend = useCallback(() => {
    if (isAutoLendEnabledForCurrentAccount) {
      setIsAutoLendDialogOpen(true)
      return
    }

    openReclaim(props.data)
  }, [isAutoLendEnabledForCurrentAccount, openReclaim, props.data])

  const handleDialogClose = () => {
    setIsAutoLendDialogOpen(false)
  }

  const handleContinueToSettings = () => {
    if (isMobile) {
      useStore.setState({ settingsModal: true })
    } else {
      document.getElementById(ACCOUNT_MENU_BUTTON_ID)?.click()
    }
    handleDialogClose()
  }

  const ITEMS: DropDownItem[] = useMemo(
    () => [
      {
        icon: <ArrowUpLine />,
        text: 'Lend more',
        onClick: () => openLend(props.data),
        disabled: !hasAssetInDeposits,
        ...(!hasAssetInDeposits && {
          disabledTooltip: `You don't have any ${props.data.asset.symbol}.
             Please first deposit ${props.data.asset.symbol} into your Credit Account before lending.`,
        }),
      },
      {
        icon: <ArrowDownLine />,
        text: 'Unlend',
        onClick: handleUnlend,
      },
    ],
    [handleUnlend, hasAssetInDeposits, openLend, props.data],
  )

  if (!address) return null

  return (
    <>
      <div className='z-10 flex justify-end'>
        <DropDownButton items={ITEMS} text='Manage' color='tertiary' />
      </div>

      <AlertDialog
        isOpen={isAutoLendDialogOpen}
        onClose={handleDialogClose}
        icon={<ExclamationMarkCircled width={18} />}
        title='Disable Automatically Lend Assets'
        content="Your auto-lend feature is currently enabled. To unlend your funds, please confirm if you'd like to disable this feature in order to continue."
        positiveButton={{
          onClick: handleContinueToSettings,
          text: 'Continue to Account Settings',
          icon: <Enter />,
        }}
        negativeButton={{
          text: 'Cancel',
          onClick: handleDialogClose,
        }}
      />
    </>
  )
}
