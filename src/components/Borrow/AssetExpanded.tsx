'use client'

import React from 'react'
import { Row } from '@tanstack/react-table'

import { getMarketAssets } from 'utils/assets'
import { Button } from 'components/Button'
import useStore from 'store'

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
    useStore.setState({ borrowModal: true })
  }

  function repayHandler() {
    useStore.setState({ repayModal: true })
  }

  return (
    <tr
      key={props.row.id}
      className='cursor-pointer'
      onClick={(e) => {
        e.preventDefault()
        const isExpanded = props.row.getIsExpanded()
        props.resetExpanded()
        !isExpanded && props.row.toggleExpanded()
      }}
    >
      <td colSpan={isActive ? 5 : 4}>
        <div className='flex justify-end p-4'>
          <Button
            onClick={borrowHandler}
            color='primary'
            text={isActive ? 'Borrow more' : 'Borrow'}
          />
          {isActive && <Button color='primary' text='Repay' />}
        </div>
      </td>
    </tr>
  )
}
