import React from 'react'

import DisplayCurrency from 'components/common/DisplayCurrency'
import { BNCoin } from 'types/classes/BNCoin'

export const TVL_META = { accessorKey: 'tvl', header: 'TVL' }

interface Props {
  vault: Vault | DepositedVault
}

export default function TVL(props: Props) {
  const { vault } = props
  const coin = BNCoin.fromDenomAndBigNumber(vault.cap.denom, vault.cap.used)

  return <DisplayCurrency coin={coin} className='text-xs' />
}
