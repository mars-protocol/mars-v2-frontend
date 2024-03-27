import React from 'react'

import { FormattedNumber } from 'components/common/FormattedNumber'
import useAsset from 'hooks/assets/useAsset'

export const UNLOCK_AMOUNT_META = { accessorKey: 'amounts.primary', header: 'Unlock Amount' }

interface Props {
  vault: DepositedVault
}

export default function UnlockTime(props: Props) {
  const primaryAsset = useAsset(props.vault.denoms.primary)
  const secondaryAsset = useAsset(props.vault.denoms.secondary)

  if (!primaryAsset) return null

  if (primaryAsset && secondaryAsset && props.vault.amounts.secondary.isPositive()) {
    return (
      <div className='flex flex-col'>
        <Amount asset={primaryAsset} amount={props.vault.amounts.primary} symbol />
        <Amount asset={secondaryAsset} amount={props.vault.amounts.secondary} symbol />
      </div>
    )
  }

  return <Amount asset={primaryAsset} amount={props.vault.amounts.primary} />
}

interface AmountProps {
  amount: BigNumber
  asset: Asset
  symbol?: boolean
}

function Amount(props: AmountProps) {
  return (
    <FormattedNumber
      className='text-xs'
      amount={props.amount.toNumber()}
      options={{
        decimals: props.asset.decimals,
        maxDecimals: props.asset.decimals > 6 ? 6 : 2,
        suffix: props.symbol ? ` ${props.asset.symbol}` : '',
      }}
    />
  )
}
