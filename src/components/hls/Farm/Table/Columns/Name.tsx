import AssetCampaignCopy from 'components/common/assets/AssetCampaignCopy'
import AssetImage from 'components/common/assets/AssetImage'
import DoubleLogo from 'components/common/DoubleLogo'
import Text from 'components/common/Text'
import { BN_ZERO } from 'constants/math'
import useAsset from 'hooks/assets/useAsset'
import usePoolAssets from 'hooks/assets/usePoolAssets'
import { useMemo } from 'react'
import { byDenom } from 'utils/array'

export const NAME_META = {
  id: 'name',
  header: 'Farm',
  accessorKey: 'name',
  meta: { className: 'min-w-50' },
}

interface Props {
  farm: AstroLp | DepositedAstroLp
  account?: Account
}

export default function Name(props: Props) {
  const { farm, account } = props
  const primaryAsset = useAsset(farm.denoms.primary)
  const poolAssets = usePoolAssets()
  const poolAsset = poolAssets.find(byDenom(farm.denoms.lp))

  const lpAmount = useMemo(() => {
    const currentLpPosition = account?.stakedAstroLps?.find(byDenom(farm.denoms.lp))
    if (!currentLpPosition) return BN_ZERO

    return currentLpPosition.amount
  }, [account?.stakedAstroLps, farm.denoms.lp])

  if (!primaryAsset && !poolAsset) return null
  return (
    <div className='flex'>
      {primaryAsset && farm.denoms.secondary === '' ? (
        <AssetImage asset={primaryAsset} className='w-8 h-8' />
      ) : (
        <DoubleLogo primaryDenom={farm.denoms.primary} secondaryDenom={farm.denoms.secondary} />
      )}
      <div className='flex flex-col gap-0.5 ml-2'>
        <Text size='xs' tag='span'>
          {farm.name}
        </Text>
        <div className='flex items-center w-full'>
          <Text size='xs' className='text-white/40' tag='span'>
            {farm.provider}
          </Text>
          {poolAsset &&
            poolAsset.campaigns.length > 0 &&
            poolAsset.campaigns.map((campaign, index) => (
              <AssetCampaignCopy
                asset={poolAsset}
                campaign={campaign}
                size='xs'
                amount={lpAmount.isZero() ? undefined : lpAmount}
                key={index}
              />
            ))}
        </div>
      </div>
    </div>
  )
}
