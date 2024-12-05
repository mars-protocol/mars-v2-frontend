import { getVaultAccountStrategiesRow } from 'components/account/AccountStrategiesTable/functions'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { BN_ZERO } from 'constants/math'
import useAsset from 'hooks/assets/useAsset'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'

export const UNLOCK_AMOUNT_META = { accessorKey: 'amounts.primary', header: 'Unlock Amount' }

interface Props {
  vault: DepositedVault
}

export default function UnlockAmount(props: Props) {
  const primaryAsset = useAsset(props.vault.denoms.primary)
  const secondaryAsset = useAsset(props.vault.denoms.secondary)
  const assets = useDepositEnabledAssets()

  if (!primaryAsset) return null

  const hasSecondary = props.vault.denoms.secondary !== ''

  if (primaryAsset && secondaryAsset && hasSecondary) {
    const unlockAmounts = getVaultAccountStrategiesRow(props.vault, assets)
    const primaryUnlockAmount = unlockAmounts?.coins?.primary?.amount ?? BN_ZERO
    const secondaryUnlockAmount = unlockAmounts?.coins?.secondary?.amount ?? BN_ZERO
    return (
      <div className='flex flex-col'>
        <FormattedNumber
          amount={primaryUnlockAmount.toNumber()}
          options={{
            suffix: ` ${primaryAsset.symbol}`,
            decimals: primaryAsset.decimals,
            maxDecimals: primaryAsset.decimals,
            abbreviated: false,
          }}
          className='text-xs'
        />
        <FormattedNumber
          amount={secondaryUnlockAmount.toNumber()}
          options={{
            suffix: ` ${secondaryAsset.symbol}`,
            decimals: secondaryAsset.decimals,
            maxDecimals: secondaryAsset.decimals,
            abbreviated: false,
          }}
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
