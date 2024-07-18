import { useCallback, useMemo } from 'react'

import DropDownButton from 'components/common/Button/DropDownButton'
import { AccountArrowDown, Plus } from 'components/common/Icons'
import useStore from 'store'

export const MANAGE_META = { accessorKey: 'details', enableSorting: false, header: '' }

interface Props {
  astroLp: DepositedAstroLp
  isExpanded: boolean
}

export default function AstroLpManage(props: Props) {
  const address = useStore((s) => s.address)

  const depositMoreHandler = useCallback(() => {
    useStore.setState({
      astroLpModal: {
        astroLp: props.astroLp,
        isDeposited: true,
        selectedBorrowDenoms: [props.astroLp.denoms.secondary],
        action: 'deposit',
      },
    })
  }, [props.astroLp])

  const withdrawHandler = useCallback(() => {
    useStore.setState({
      astroLpModal: {
        astroLp: props.astroLp,
        isDeposited: true,
        selectedBorrowDenoms: [props.astroLp.denoms.secondary],
        action: 'withdraw',
      },
    })
  }, [props.astroLp])

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
      <DropDownButton items={ITEMS} text='Manage' color='tertiary' />
    </div>
  )
}
