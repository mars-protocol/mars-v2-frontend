import React from 'react'

import { FormattedNumber } from 'components/FormattedNumber'
import Loading from 'components/Loading'
import TitleAndSubCell from 'components/TitleAndSubCell'
import { VAULT_DEPOSIT_BUFFER } from 'constants/vaults'
import { getAssetByDenom } from 'utils/assets'

export const DEPOSIT_CAP_META = { accessorKey: 'cap', header: 'Deposit Cap' }

interface Props {
  vault: Vault | DepositedVault
  isLoading: boolean
}

export default function DepositCap(props: Props) {
  const { vault } = props

  if (props.isLoading) return <Loading />

  const percent = vault.cap.used
    .dividedBy(vault.cap.max.multipliedBy(VAULT_DEPOSIT_BUFFER))
    .multipliedBy(100)
    .integerValue()

  const decimals = getAssetByDenom(vault.cap.denom)?.decimals ?? 6

  return (
    <TitleAndSubCell
      title={
        <FormattedNumber
          amount={vault.cap.max.toNumber()}
          options={{ minDecimals: 2, abbreviated: true, decimals }}
          className='text-xs'
          animate
        />
      }
      sub={
        <FormattedNumber
          amount={percent.toNumber()}
          options={{ minDecimals: 2, maxDecimals: 2, suffix: '% Filled' }}
          className='text-xs'
          animate
        />
      }
    />
  )
}
