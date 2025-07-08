import DisplayCurrency from 'components/common/DisplayCurrency'
import Loading from 'components/common/Loading'
import useManagedVaultUserPosition from 'hooks/managedVaults/useManagedVaultUserPosition'
import useStore from 'store'
import { BN } from 'utils/helpers'
import { BNCoin } from 'types/classes/BNCoin'
import { useManagedVaultConvertToBaseTokens } from 'hooks/managedVaults/useManagedVaultConvertToBaseTokens'

export const MY_POSITION_META = {
  header: 'My Position',
  meta: { className: 'min-w-30' },
}

interface Props {
  vault: ManagedVaultWithDetails
  isLoading: boolean
}

export default function MyPosition({ vault, isLoading }: Props) {
  const address = useStore((s) => s.address)
  const { data: userPosition } = useManagedVaultUserPosition(vault.vault_address, address)
  const { data: userTokens, isLoading: isLoadingTokens } = useManagedVaultConvertToBaseTokens(
    vault.vault_address,
    userPosition?.shares ?? '0',
  )

  if (isLoading || isLoadingTokens) return <Loading />

  const coin = BNCoin.fromDenomAndBigNumber(vault.base_tokens_denom, BN(userTokens || 0))

  return (
    <DisplayCurrency coin={coin} className='text-xs' options={{ minDecimals: 2, maxDecimals: 2 }} />
  )
}
