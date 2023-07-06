import { Row } from '@tanstack/react-table'
import { useMemo } from 'react'

import Button from 'components/Button'
import { Plus } from 'components/Icons'
import useStore from 'store'
import { getEnabledMarketAssets } from 'utils/assets'

type AssetRowProps = {
  row: Row<BorrowAsset | BorrowAssetActive>
  onBorrowClick: () => void
  onRepayClick: () => void
  resetExpanded: (defaultState?: boolean | undefined) => void
}

export default function AssetExpanded(props: AssetRowProps) {
  const marketAssets = getEnabledMarketAssets()
  const asset = marketAssets.find((asset) => asset.denom === props.row.original.denom)

  const isActive = useMemo(
    () => !!(props.row.original as BorrowAssetActive)?.debt,
    [props.row.original],
  )

  if (!asset) return null

  function borrowHandler() {
    if (!asset) return null
    useStore.setState({ borrowModal: { asset: asset, marketData: props.row.original } })
  }

  function repayHandler() {
    if (!asset) return null
    useStore.setState({
      borrowModal: { asset: asset, marketData: props.row.original, isRepay: true },
    })
  }

  return (
    <tr
      key={props.row.id}
      className='cursor-pointer bg-black/20 transition-colors'
      onClick={(e) => {
        e.preventDefault()
        const isExpanded = props.row.getIsExpanded()
        props.resetExpanded()
        !isExpanded && props.row.toggleExpanded()
      }}
    >
      <td colSpan={isActive ? 5 : 4}>
        <div className='flex justify-end gap-4 p-4'>
          <Button
            leftIcon={isActive ? <Plus /> : undefined}
            onClick={borrowHandler}
            color='secondary'
            text={isActive ? 'Borrow more' : 'Borrow'}
            className='min-w-40 text-center'
          />
          {isActive && <Button color='secondary' text='Repay' onClick={repayHandler} />}
        </div>
      </td>
    </tr>
  )
}
