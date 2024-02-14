import { useCallback, useMemo } from 'react'

import { ACCOUNT_MENU_BUTTON_ID } from 'components/account/AccountMenuContent'
import DropDownButton from 'components/common/Button/DropDownButton'
import { ArrowDownLine, ArrowUpLine, Enter, ExclamationMarkCircled } from 'components/common/Icons'
import useAlertDialog from 'hooks/useAlertDialog'
import useAutoLend from 'hooks/useAutoLend'
import useLendAndReclaimModal from 'hooks/useLendAndReclaimModal'
import useStore from 'store'

export const MANAGE_META = {
  accessorKey: 'manage',
  enableSorting: false,
  header: '',
}

interface Props {
  data: LendingMarketTableData
}
export default function Manage(props: Props) {
  const { openLend, openReclaim } = useLendAndReclaimModal()
  const { isAutoLendEnabledForCurrentAccount } = useAutoLend()
  const { open: showAlertDialog } = useAlertDialog()
  const address = useStore((s) => s.address)

  const hasLendAsset = useMemo(
    () => !!props.data.accountLentValue && props.data.accountLentValue.isGreaterThan(0),
    [props.data.accountLentValue],
  )

  const handleUnlend = useCallback(() => {
    if (isAutoLendEnabledForCurrentAccount) {
      showAlertDialog({
        icon: <ExclamationMarkCircled width={18} />,
        title: 'Disable Automatically Lend Assets',
        content:
          "Your auto-lend feature is currently enabled. To unlend your funds, please confirm if you'd like to disable this feature in order to continue.",
        positiveButton: {
          onClick: () => document.getElementById(ACCOUNT_MENU_BUTTON_ID)?.click(),
          text: 'Continue to Account Settings',
          icon: <Enter />,
        },
        negativeButton: {
          text: 'Cancel',
        },
      })

      return
    }

    openReclaim(props.data)
  }, [isAutoLendEnabledForCurrentAccount, openReclaim, props.data, showAlertDialog])

  const ITEMS: DropDownItem[] = useMemo(
    () => [
      {
        icon: <ArrowUpLine />,
        text: hasLendAsset ? 'Lend more' : 'Lend',
        onClick: () => openLend(props.data),
      },
      {
        icon: <ArrowDownLine />,
        text: 'Unlend',
        onClick: handleUnlend,
      },
    ],
    [handleUnlend, hasLendAsset, openLend, props.data],
  )

  if (!address) return null

  return (
    <div className='flex justify-end z-10'>
      <DropDownButton items={ITEMS} text='Manage' color='tertiary' />
    </div>
  )
}
