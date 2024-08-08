import AssetCampaignCopy from 'components/common/assets/AssetCampaignCopy'
import AssetImage from 'components/common/assets/AssetImage'
import DoubleLogo from 'components/common/DoubleLogo'
import Text from 'components/common/Text'
import useAsset from 'hooks/assets/useAsset'
import usePoolAssets from 'hooks/assets/usePoolAssets'
import { VaultStatus } from 'types/enums'
import { byDenom } from 'utils/array'

export const NAME_META = {
  id: 'name',
  header: 'Vault',
  accessorKey: 'name',
  meta: { className: 'min-w-50' },
}
interface Props {
  vault: Vault | DepositedVault | AstroLp | DepositedAstroLp
}

export default function Name(props: Props) {
  const { vault } = props
  const timeframe = vault.lockup.timeframe[0]
  const unlockDuration = timeframe ? ` - (${vault.lockup.duration}${timeframe})` : ''
  const primaryAsset = useAsset(vault.denoms.primary)
  const poolAssets = usePoolAssets()

  const poolAsset = poolAssets.find(byDenom(vault.denoms.lp))

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
      <div className='flex flex-col gap-0.5 ml-2'>
        <Text size='xs' tag='span'>
          {`${vault.name}${unlockDuration}`}
        </Text>
        <div className='flex items-center w-full'>
          <Text size='xs' className='text-white/40' tag='span'>
            {vault.provider}
          </Text>
          {poolAsset?.campaign && <AssetCampaignCopy asset={poolAsset} size='xs' />}
        </div>
      </div>
    </div>
  )
}
