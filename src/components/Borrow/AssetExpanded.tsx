'use client'

import { Row } from '@tanstack/react-table'

import { Button } from 'components/Button'
import useStore from 'store'
import { getMarketAssets } from 'utils/assets'

type AssetRowProps = {
  row: Row<BorrowAsset | BorrowAssetActive>
  onBorrowClick: () => void
  onRepayClick: () => void
  resetExpanded: (defaultState?: boolean | undefined) => void
}

export default function AssetExpanded(props: AssetRowProps) {
  const marketAssets = getMarketAssets()
  const asset = marketAssets.find((asset) => asset.denom === props.row.original.denom)
  let isActive: boolean = false

  if ((props.row.original as BorrowAssetActive)?.debt) {
    isActive = true
  }

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
            onClick={borrowHandler}
            color='primary'
            text={isActive ? 'Borrow more' : 'Borrow'}
          />
          {isActive && <Button color='primary' text='Repay' onClick={repayHandler} />}
        </div>
      </td>
    </tr>
  )
}
