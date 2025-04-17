import AssetImage from 'components/common/assets/AssetImage'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Loading from 'components/common/Loading'
import useVaultAssets from 'hooks/assets/useVaultAssets'
import { BN } from 'utils/helpers'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { Row } from '@tanstack/react-table'

export const TVL_META = {
  accessorKey: 'base_tokens_amount',
  header: 'TVL',
  meta: { className: 'w-30' },
  sortingFn: (a: Row<ManagedVaultsData>, b: Row<ManagedVaultsData>) => {
    const amountA = Number(a.original.base_tokens_amount)
    const amountB = Number(b.original.base_tokens_amount)
    return amountA - amountB
  },
}

interface Props {
  value: ManagedVaultsData
  isLoading: boolean
}

export default function TVL({ value, isLoading }: Props) {
  const vaultAssets = useVaultAssets()

  if (isLoading) return <Loading />

  const asset = vaultAssets.find(byDenom(value.base_tokens_denom))
  const coin = BNCoin.fromDenomAndBigNumber(value.base_tokens_denom, BN(value.base_tokens_amount))

  return (
    <div className='flex items-center justify-end gap-2'>
      {asset && <AssetImage asset={asset} className='w-6 h-6' />}
      <DisplayCurrency coin={coin} className='text-xs' />
    </div>
  )
}
