import classNames from 'classnames'
import { useCallback, useEffect, useMemo, useState } from 'react'

import Button from 'components/common/Button'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { Cross, Logo } from 'components/common/Icons'
import Overlay from 'components/common/Overlay'
import SwitchWithText from 'components/common/Switch/SwitchWithText'
import Text from 'components/common/Text'
import CampaignRewards from 'components/header/RewardsCenter//CampaignRewards'
import RewardsByPosition from 'components/header/RewardsCenter/RewardsByPosition'
import RewardsByToken from 'components/header/RewardsCenter/RewardsByToken'
import { BN_ZERO } from 'constants/math'
import { ORACLE_DENOM } from 'constants/oracle'
import useAccountId from 'hooks/accounts/useAccountId'
import useAssets from 'hooks/assets/useAssets'
import useCampaignPoints from 'hooks/campaign/useCampaignPoints'
import useIsOsmosis from 'hooks/chain/useIsOsmosis'
import useToggle from 'hooks/common/useToggle'
import useStakedAstroLpRewards from 'hooks/incentives/useStakedAstroLpRewards'
import useUnclaimedRewards from 'hooks/incentives/useUnclaimedRewards'
import useRewardsCenterType from 'hooks/localStorage/useRewardsCenterType'
import useAutoLend from 'hooks/wallet/useAutoLend'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { RewardsCenterType } from 'types/enums'
import { getCoinValue } from 'utils/formatters'
import { mergeBNCoinArrays } from 'utils/helpers'

interface Props {
  className?: string
}
export default function RewardsCenter(props: Props) {
  const accountId = useAccountId()
  const [rewardsCenterType, setRewardCenterType] = useRewardsCenterType()
  const [showRewardsCenter, setShowRewardsCenter] = useToggle()
  const [isConfirming, setIsConfirming] = useState(false)
  const { data: redBankRewards } = useUnclaimedRewards()
  const { data: assets } = useAssets()
  const isOsmosis = useIsOsmosis()
  const { data: campaignPoints } = useCampaignPoints()
  const { isAutoLendEnabledForCurrentAccount: isAutoLend } = useAutoLend()

  const { data: stakedAstroLpRewards } = useStakedAstroLpRewards()

  const currentLpRewards = useMemo(() => {
    let currentLpRewardsArray = [] as BNCoin[]
    if (stakedAstroLpRewards.length === 0) return currentLpRewardsArray
    stakedAstroLpRewards.forEach((stakeAstroLpReward) => {
      currentLpRewardsArray = mergeBNCoinArrays(currentLpRewardsArray, stakeAstroLpReward.rewards)
    })
    return currentLpRewardsArray
  }, [stakedAstroLpRewards])

  const rewards = useMemo(
    () => mergeBNCoinArrays(redBankRewards, currentLpRewards),
    [redBankRewards, currentLpRewards],
  )

  const rewardsValue = useMemo(() => {
    return rewards.reduce((acc, reward) => {
      const value = getCoinValue(reward, assets)
      return acc.plus(value)
    }, BN_ZERO)
  }, [assets, rewards])

  const rewardsValueCoin = useMemo(
    () => BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, rewardsValue),
    [rewardsValue],
  )

  const claimRewards = useStore((s) => s.claimRewards)

  const handleClick = useCallback(async () => {
    setIsConfirming(true)
    await claimRewards({
      accountId: accountId ?? '',
      redBankRewards,
      stakedAstroLpRewards,
      lend: isAutoLend,
    })
    setIsConfirming(false)
    setShowRewardsCenter(false)
  }, [
    accountId,
    claimRewards,
    isAutoLend,
    redBankRewards,
    setShowRewardsCenter,
    stakedAstroLpRewards,
  ])

  useEffect(() => {
    if (isOsmosis) setRewardCenterType(RewardsCenterType.Token)
  }, [isOsmosis, rewardsCenterType, setRewardCenterType])

  return (
    <div className={classNames('relative', props.className)}>
      <Button
        variant='solid'
        color='secondary'
        leftIcon={<Logo />}
        onClick={() => {
          setShowRewardsCenter(!showRewardsCenter)
        }}
        hasFocus={showRewardsCenter}
      >
        <div className='relative flex items-center h-full'>
          <DisplayCurrency coin={rewardsValueCoin} allowZeroAmount />
        </div>
      </Button>
      <Overlay
        className={
          'mt-2 right-0 md:top-8 top-16 content-start h-screen-full pb-20 md:pb-0 md:h-auto overflow-y-scroll scrollbar-hide w-full md:w-[420px] flex flex-wrap'
        }
        show={showRewardsCenter}
        setShow={setShowRewardsCenter}
      >
        <div
          className={classNames(
            'flex h-[54px] w-full items-center justify-between bg-surface px-4 py-3',
            'border border-transparent border-b-white/10',
          )}
        >
          <Text size='lg' className='font-bold'>
            Rewards Center
          </Text>
          <div className='absolute top-2 right-2 md:hidden'>
            <Button
              onClick={() => setShowRewardsCenter(false)}
              leftIcon={<Cross />}
              iconClassName='w-3'
              color='tertiary'
              className='w-8 h-8'
              size='xs'
            />
          </div>
        </div>
        <div className='flex flex-col w-full gap-4 p-4'>
          {!isOsmosis && (
            <SwitchWithText
              options={[
                { text: 'By Token', value: RewardsCenterType.Token },
                { text: 'By Position', value: RewardsCenterType.Position },
              ]}
              selected={rewardsCenterType}
              onChange={(value) => setRewardCenterType(value as RewardsCenterType)}
              className='w-full'
            />
          )}
          <Text size='xs' className='w-full'>
            Total Rewards
          </Text>
          <div className='flex flex-wrap content-center justify-center w-full gap-1 p-4 rounded-sm bg-black/20'>
            <DisplayCurrency coin={rewardsValueCoin} allowZeroAmount className='text-2xl' />
            <Text size='xs' className='w-full text-center text-white/60'>
              Unclaimed Rewards
            </Text>
          </div>
          {campaignPoints && <CampaignRewards campaignPoints={campaignPoints} />}
          <RewardsByToken
            rewards={rewards}
            assets={assets}
            active={rewardsCenterType === RewardsCenterType.Token || isOsmosis}
          />
          <RewardsByPosition
            redBankRewards={redBankRewards}
            stakedAstroLpRewards={stakedAstroLpRewards}
            assets={assets}
            active={rewardsCenterType === RewardsCenterType.Position}
          />
          <Button
            className='w-full'
            onClick={() => handleClick()}
            disabled={rewards.length === 0}
            showProgressIndicator={isConfirming}
          >
            Claim All Rewards
          </Button>
        </div>
      </Overlay>
    </div>
  )
}
