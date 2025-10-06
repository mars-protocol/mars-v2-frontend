import useVaultAssets from 'hooks/assets/useVaultAssets'
import { byDenom } from 'utils/array'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'
import AssetImage from 'components/common/assets/AssetImage'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { useManagedVaultConvertToBaseTokens } from 'hooks/managedVaults/useManagedVaultConvertToBaseTokens'
import Loading from 'components/common/Loading'

interface Props {
  value: ManagedVaultDepositor
  baseTokensDenom: string
  vaultAddress: string
}

export default function UserValue(props: Props) {
  const { value, baseTokensDenom, vaultAddress } = props
  const vaultAssets = useVaultAssets()
  const asset = vaultAssets.find(byDenom(baseTokensDenom))

  const { data: userVaultTokensAmount, isLoading } = useManagedVaultConvertToBaseTokens(
    vaultAddress,
    value.balance.amount ?? '0',
  )

  if (isLoading) {
    return (
      <div className='flex items-center justify-end'>
        <Loading className='w-12 h-4' />
      </div>
    )
  }

  return (
    <div className='flex items-center justify-end gap-2'>
      <AssetImage asset={asset} className='w-4 h-4' />
      <DisplayCurrency
        coin={BNCoin.fromDenomAndBigNumber(baseTokensDenom, BN(userVaultTokensAmount ?? 0))}
        className='text-xs'
      />
    </div>
  )
}
