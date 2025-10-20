import AssetImage from 'components/common/assets/AssetImage'
import Button from 'components/common/Button'
import DisplayCurrency from 'components/common/DisplayCurrency'
import DoubleLogo from 'components/common/DoubleLogo'
import { Logo } from 'components/common/Icons'
import Text from 'components/common/Text'
import { BN_ZERO } from 'constants/math'
import { ORACLE_DENOM } from 'constants/oracle'
import useAccountId from 'hooks/accounts/useAccountId'
import useAssets from 'hooks/assets/useAssets'
import useAutoLend from 'hooks/wallet/useAutoLend'
import { useCallback, useMemo, useState } from 'react'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { getCoinValue } from 'utils/formatters'

interface Props {
  denom: string
  rewards: BNCoin[]
  assets: Asset[]
}

function getPositionLogo(asset?: Asset) {
  if (!asset) return null
  if (asset.poolInfo)
    return (
      <DoubleLogo
        primaryDenom={asset.poolInfo.assets.primary.denom}
        secondaryDenom={asset.poolInfo.assets.secondary.denom}
      />
    )
  return <AssetImage asset={asset} className='w-8 h-8 mr-1' />
}

export default function RewardsPosition(props: Props) {
  const { denom, rewards } = props
  const { data: assets } = useAssets()
  const accountId = useAccountId()
  const [isConfirming, setIsConfirming] = useState(false)
  const { isAutoLendEnabledForCurrentAccount: isAutoLend } = useAutoLend()

  const isRedBank = denom === 'redbank'
  const positionAsset = isRedBank ? assets[0] : assets.find(byDenom(denom))

  const rewardsValue = useMemo(() => {
    return rewards.reduce((acc, reward) => {
      const value = getCoinValue(reward, assets)
      return acc.plus(value)
    }, BN_ZERO)
  }, [assets, rewards])

  const rewardsCoin = useMemo(
    () => BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, rewardsValue),
    [rewardsValue],
  )

  const claimRewards = useStore((s) => s.claimRewards)

  const handleClick = useCallback(async () => {
    setIsConfirming(true)
    await claimRewards({
      accountId: accountId || '',
      redBankRewards: denom === 'redbank' ? rewards : undefined,
      stakedAstroLpRewards: denom !== 'redbank' ? [{ lpDenom: denom, rewards }] : undefined,
      lend: isAutoLend,
    })
    setIsConfirming(false)
  }, [accountId, claimRewards, denom, isAutoLend, rewards])

  if (!positionAsset) return null

  return (
    <div className='flex items-center justify-between w-full p-4 rounded-md '>
      <div className='flex items-center gap-2'>
        {isRedBank ? (
          <div className='w-8 h-8 mr-1'>
            <Logo />
          </div>
        ) : (
          getPositionLogo(positionAsset)
        )}
        <div className='flex flex-wrap'>
          <Text size='sm'>{isRedBank ? 'Red Bank Rewards' : positionAsset.name}</Text>
          <DisplayCurrency coin={rewardsCoin} className='w-full text-xs text-white/60' />
        </div>
      </div>
      <Button
        variant='solid'
        color='secondary'
        size='sm'
        text='Claim'
        showProgressIndicator={isConfirming}
        onClick={handleClick}
      />
    </div>
  )
}
