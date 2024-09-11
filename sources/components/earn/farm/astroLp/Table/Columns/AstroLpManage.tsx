import { useCallback, useMemo } from 'react'

import useStore from '../../../../../../store'
import DropDownButton from '../../../../../common/Button/DropDownButton'
import { AccountArrowDown, Plus } from '../../../../../common/Icons'

export const MANAGE_META = {
  accessorKey: 'details',
  enableSorting: false,
  header: '',
  meta: { className: 'w-30' },
}

interface Props {
  astroLp: DepositedAstroLp
  isExpanded: boolean
}

export default function AstroLpManage(props: Props) {
  const address = useStore((s) => s.address)

  const depositMoreHandler = useCallback(() => {
    useStore.setState({
      farmModal: {
        farm: props.astroLp,
        isDeposited: true,
        selectedBorrowDenoms: [],
        action: 'deposit',
        type: 'astroLp',
      },
    })
  }, [props.astroLp])

  const withdrawHandler = useCallback(() => {
    useStore.setState({
      farmModal: {
        farm: props.astroLp,
        isDeposited: true,
        selectedBorrowDenoms: [],
        action: 'withdraw',
        type: 'astroLp',
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
