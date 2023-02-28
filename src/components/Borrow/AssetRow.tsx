import React from 'react'
import { flexRender, Row } from '@tanstack/react-table'

import { getMarketAssets } from 'utils/assets'

type AssetRowProps = {
  row: Row<BorrowAsset | BorrowAssetActive>
  resetExpanded: (defaultState?: boolean | undefined) => void
}

export const AssetRow = (props: AssetRowProps) => {
  const marketAssets = getMarketAssets()
  const asset = marketAssets.find((asset) => asset.denom === props.row.original.denom)

  if (!asset) return null

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
      {props.row.getVisibleCells().map((cell, index) => {
        return (
          <td key={cell.id} className={'p-4 text-right'}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        )
      })}
    </tr>
  )
}
