import React from 'react'

import { getMarketAssets } from 'utils/assets'
import { Row } from '@tanstack/react-table'
import { Button } from 'components/Button'
import { useRouter } from 'next/navigation'

type AssetRowProps = {
  row: Row<BorrowAsset>
  onBorrowClick: () => void
  onRepayClick: () => void
  resetExpanded: (defaultState?: boolean | undefined) => void
}

export default function AssetExpanded(props: AssetRowProps) {
  const router = useRouter()
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
      <td colSpan={4}>
        <div className='flex justify-end p-4'>
          <Button color='secondary' text='CLick me' onClick={() => router.refresh()} />
          <Button color='primary' text='CLick me' />
        </div>
      </td>
    </tr>
  )
}
