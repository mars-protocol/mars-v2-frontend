import DisplayCurrency from 'components/common/DisplayCurrency'
import Loading from 'components/common/Loading'
import { BN } from 'utils/helpers'
import { BNCoin } from 'types/classes/BNCoin'
import { useManagedVaultConvertToBaseTokens } from 'hooks/managedVaults/useManagedVaultConvertToBaseTokens'

interface Props {
  value: ManagedVaultDepositor
  baseTokensDenom: string
  vaultAddress: string
}

export default function UserValue(props: Props) {
  const { value, baseTokensDenom, vaultAddress } = props

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
    <DisplayCurrency
      coin={BNCoin.fromDenomAndBigNumber(baseTokensDenom, BN(userVaultTokensAmount ?? 0))}
      className='text-xs'
    />
  )
}
