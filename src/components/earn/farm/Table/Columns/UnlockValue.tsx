import { BNCoin } from 'classes/BNCoin'
import { getVaultAccountStrategiesRow } from 'components/account/AccountStrategiesTable/functions'
import DisplayCurrency from 'components/common/DisplayCurrency'
import useAllAssets from 'hooks/assets/useAllAssets'
import useAsset from 'hooks/assets/useAsset'
import usePrices from 'hooks/prices/usePrices'
import { BN } from 'utils/helpers'

export const UNLOCK_VALUE_META = { accessorKey: 'values.net', header: 'Net value' }

interface Props {
  vault: DepositedVault
}

export default function UnlockValue(props: Props) {
  const primaryAsset = useAsset(props.vault.denoms.primary)
  const secondaryAsset = useAsset(props.vault.denoms.secondary)
  const { data: prices } = usePrices()
  const assets = useAllAssets()

  if (primaryAsset && secondaryAsset) {
    const unlockValue = getVaultAccountStrategiesRow(props.vault, prices, assets)

    return (
      <DisplayCurrency
        className='text-xs'
        coin={BNCoin.fromDenomAndBigNumber('usd', BN(unlockValue.value))}
      />
    )
  }

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
