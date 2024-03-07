import React from 'react'

import DisplayCurrency from 'components/common/DisplayCurrency'
import { BNCoin } from 'types/classes/BNCoin'

export const TVL_META = { accessorKey: 'tvl', header: 'TVL' }

interface Props {
  amount?: BigNumber
  denom?: string
}

export default function TVL(props: Props) {
  if (!props.denom || !props.amount) return null

  const coin = BNCoin.fromDenomAndBigNumber(props.denom, props.amount)

  return <DisplayCurrency coin={coin} className='text-xs' />
}
