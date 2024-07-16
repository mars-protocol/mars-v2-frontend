import DropDownButton from 'components/common/Button/DropDownButton'
import { HandCoins, Plus } from 'components/common/Icons'
import { useCallback, useMemo } from 'react'
import useStore from 'store'

export const MANAGE_META = {
  accessorKey: 'manage',
  enableSorting: false,
  header: '',
}

interface Props {
  data: BorrowMarketTableData
}

export default function Manage(props: Props) {
  const address = useStore((s) => s.address)

  const borrowHandler = useCallback(() => {
    if (!props.data.asset) return null
    useStore.setState({ borrowModal: { asset: props.data.asset, marketData: props.data } })
  }, [props.data])

  const repayHandler = useCallback(() => {
    if (!props.data.asset) return null
    useStore.setState({
      borrowModal: { asset: props.data.asset, marketData: props.data, isRepay: true },
    })
  }, [props.data])

  const isNotUSDCAxelar =
    props.data.asset.denom !==
    'ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858'

  const ITEMS: DropDownItem[] = useMemo(
    () => [
      ...(isNotUSDCAxelar
        ? [
            {
              icon: <Plus />,
              text: 'Borrow more',
              onClick: borrowHandler,
            },
          ]
        : []),
      {
        icon: <HandCoins />,
        text: 'Repay',
        onClick: repayHandler,
      },
    ],
    [borrowHandler, repayHandler, isNotUSDCAxelar],
  )

  if (!address) return null

  return (
    <div className='z-10 flex justify-end'>
      <DropDownButton items={ITEMS} text='Manage' color='tertiary' />
    </div>
  )
}
