import { getVaultAccountStrategiesRow } from 'components/account/AccountStrategiesTable/functions'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { BN_ZERO } from 'constants/math'
import useAsset from 'hooks/assets/useAsset'
import usePrices from 'hooks/usePrices'

export const UNLOCK_AMOUNT_META = { accessorKey: 'amounts.primary', header: 'Unlock Amount' }

interface Props {
  vault: DepositedVault
}

export default function UnlockAmount(props: Props) {
  const primaryAsset = useAsset(props.vault.denoms.primary)
  const secondaryAsset = useAsset(props.vault.denoms.secondary)
  const { data: prices } = usePrices()

  if (!primaryAsset) return null

  if (primaryAsset && secondaryAsset) {
    const unlockAmounts = getVaultAccountStrategiesRow(props.vault, prices)
    const primaryUnlockAmount =
      unlockAmounts?.amount?.find((coin) => coin.denom === props.vault.denoms.primary)?.amount ??
      BN_ZERO
    const secondaryUnlockAmount =
      unlockAmounts?.amount?.find((coin) => coin.denom === props.vault.denoms.secondary)?.amount ??
      BN_ZERO
    return (
      <div className='flex flex-col'>
        <FormattedNumber
          amount={primaryUnlockAmount.toNumber()}
          options={{ suffix: ` ${primaryAsset.symbol}` }}
          className='text-xs'
        />
        <FormattedNumber
          amount={secondaryUnlockAmount.toNumber()}
          options={{ suffix: ` ${primaryAsset.symbol}` }}
          className='text-xs'
        />
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
