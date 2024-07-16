import { useCallback, useMemo, useState } from 'react'

import DropDownButton from 'components/common/Button/DropDownButton'
import { AccountArrowDown, Plus } from 'components/common/Icons'
import useAccountId from 'hooks/accounts/useAccountId'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useSlippage from 'hooks/settings/useSlippage'
import useStore from 'store'

export const MANAGE_META = { accessorKey: 'details', enableSorting: false, header: '' }

interface Props {
  farm: DepositedFarm
  isExpanded: boolean
}

export default function FarmManage(props: Props) {
  const accountId = useAccountId()
  const account = useCurrentAccount()
  const address = useStore((s) => s.address)
  const withdrawFromFarms = useStore((s) => s.withdrawFromFarms)
  const [slippage] = useSlippage()
  const [isConfirming, setIsConfirming] = useState(false)

  const depositMoreHandler = useCallback(() => {
    useStore.setState({
      farmModal: {
        farm: props.farm,
        isDeposited: true,
        selectedBorrowDenoms: [props.farm.denoms.secondary],
        action: 'deposit',
      },
    })
  }, [props.farm])

  const withdrawHandler = useCallback(() => {
    useStore.setState({
      farmModal: {
        farm: props.farm,
        isDeposited: true,
        selectedBorrowDenoms: [props.farm.denoms.secondary],
        action: 'withdraw',
      },
    })
  }, [props.farm])

  const ITEMS: DropDownItem[] = useMemo(
    () => [
      {
        icon: <Plus />,
        text: 'Deposit more',
        onClick: depositMoreHandler,
      },
      {
        icon: <AccountArrowDown />,
        text: 'Withdraw funds',
        onClick: withdrawHandler,
      },
    ],
    [depositMoreHandler, withdrawHandler],
  )

  if (!address) return null

  return (
    <div className='z-10 flex justify-end'>
      <DropDownButton
        items={ITEMS}
        text='Manage'
        color='tertiary'
        showProgressIndicator={isConfirming}
      />
    </div>
  )
}
