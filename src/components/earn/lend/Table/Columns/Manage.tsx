import { useCallback, useMemo } from 'react'

import { ACCOUNT_MENU_BUTTON_ID } from 'components/account/AccountMenuContent'
import DropDownButton from 'components/common/Button/DropDownButton'
import { ArrowDownLine, ArrowUpLine, Enter, ExclamationMarkCircled } from 'components/common/Icons'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAlertDialog from 'hooks/useAlertDialog'
import useAutoLend from 'hooks/useAutoLend'
import useLendAndReclaimModal from 'hooks/useLendAndReclaimModal'
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
  const { open: showAlertDialog } = useAlertDialog()
  const address = useStore((s) => s.address)
  const account = useCurrentAccount()

  const hasAssetInDeposits = useMemo(
    () => !!account?.deposits?.find((deposit) => deposit.denom === props.data.asset.denom),
    [account?.deposits, props.data.asset.denom],
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
        text: 'Lend more',
        onClick: () => openLend(props.data),
        disabled: !hasAssetInDeposits,
        disabledTooltip: `You don’t have any ${props.data.asset.symbol}.
             Please first deposit ${props.data.asset.symbol} into your Credit Account before lending.`,
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
    <div className='z-10 flex justify-end'>
      <DropDownButton items={ITEMS} text='Manage' color='tertiary' />
    </div>
  )
}
