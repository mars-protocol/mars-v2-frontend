import { getVaultAccountStrategiesRow } from 'components/account/AccountStrategiesTable/functions'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { BN_ZERO } from 'constants/math'
import useAllAssets from 'hooks/assets/useAllAssets'
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
  const assets = useAllAssets()

  if (!primaryAsset) return null

  if (primaryAsset && secondaryAsset) {
    const unlockAmounts = getVaultAccountStrategiesRow(props.vault, prices, assets)
    const primaryUnlockAmount = unlockAmounts?.coins?.primary?.amount ?? BN_ZERO
    const secondaryUnlockAmount = unlockAmounts?.coins?.secondary?.amount ?? BN_ZERO
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

  return (
    <FormattedNumber
      className='text-xs'
      amount={props.vault.amounts.primary.toNumber()}
      options={{
        decimals: primaryAsset.decimals,
        maxDecimals: primaryAsset.decimals > 6 ? 6 : 2,
        suffix: ` ${primaryAsset.symbol}`,
      }}
    />
  )
}
