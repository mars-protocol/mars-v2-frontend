import React from 'react'

import DisplayCurrency from 'components/common/DisplayCurrency'
import Loading from 'components/common/Loading'
import { BNCoin } from 'types/classes/BNCoin'

export const TVL_META = { accessorKey: 'tvl', header: 'TVL' }

interface Props {
  vault: Vault | DepositedVault
  isLoading: boolean
}

export default function TVL(props: Props) {
  const { vault } = props
  if (props.isLoading) return <Loading />
  const coin = BNCoin.fromDenomAndBigNumber(vault.cap.denom, vault.cap.used)

  return <DisplayCurrency coin={coin} className='text-xs' />
}
