import React from 'react'

import DisplayCurrency from 'components/common/DisplayCurrency'
import { BNCoin } from 'types/classes/BNCoin'

export const UNLOCK_VALUE_META = { accessorKey: 'values.net', header: 'Net value' }

interface Props {
  vault: DepositedVault
}

export default function UnlockTime(props: Props) {
  return (
    <DisplayCurrency
      className='text-xs'
      coin={BNCoin.fromDenomAndBigNumber(
        'usd',
        props.vault.values.primary.plus(props.vault.values.secondary),
      )}
    />
  )
}
