import { useManagedVaultUserShares } from 'hooks/managedVaults/useManagedVaultUserShares'
import { useManagedVaultConvertToTokens } from 'hooks/managedVaults/useManagedVaultConvertToTokens'
import useStore from 'store'
import Loading from 'components/common/Loading'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

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
  const { amount: userShares } = useManagedVaultUserShares(address, vault.vault_tokens_denom)
  const { data: userTokens, isLoading: isLoadingTokens } = useManagedVaultConvertToTokens(
    vault.vault_address,
    userShares,
  )

  if (isLoading || isLoadingTokens) return <Loading />

  const coin = BNCoin.fromDenomAndBigNumber(vault.base_tokens_denom, BN(userTokens || 0))

  return (
    <DisplayCurrency coin={coin} className='text-xs' options={{ minDecimals: 2, maxDecimals: 2 }} />
  )
}
