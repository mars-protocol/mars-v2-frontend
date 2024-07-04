import AssetImage from 'components/common/assets/AssetImage'
import DoubleLogo from 'components/common/DoubleLogo'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import useAsset from 'hooks/assets/useAsset'
import { VaultStatus } from 'types/enums'

export const NAME_META = {
  id: 'name',
  header: 'Vault',
  accessorKey: 'name',
  meta: { className: 'min-w-50' },
}
interface Props {
  vault: Vault | DepositedVault | Farm | DepositedFarm
}

export default function Name(props: Props) {
  const { vault } = props
  const timeframe = vault.lockup.timeframe[0]
  const unlockDuration = !!timeframe ? ` - (${vault.lockup.duration}${timeframe})` : ''
  const primaryAsset = useAsset(vault.denoms.primary)
  let status: VaultStatus = VaultStatus.ACTIVE
  if ('status' in vault) {
    status = vault.status as VaultStatus
  }

  if (!primaryAsset) return null

  return (
    <div className='flex'>
      {vault.denoms.secondary === '' ? (
        <AssetImage asset={primaryAsset} className='w-8 h-8' />
      ) : (
        <DoubleLogo primaryDenom={vault.denoms.primary} secondaryDenom={vault.denoms.secondary} />
      )}

      <TitleAndSubCell
        className='ml-2 mr-2 text-left'
        title={`${vault.name}${unlockDuration}`}
        sub={vault.provider}
      />
    </div>
  )
}
