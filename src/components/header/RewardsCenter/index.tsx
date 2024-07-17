import classNames from 'classnames'
import { useCallback, useEffect, useMemo, useState } from 'react'

import Button from 'components/common/Button'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { Logo } from 'components/common/Icons'
import Overlay from 'components/common/Overlay'
import SwitchWithText from 'components/common/Switch/SwitchWithText'
import Text from 'components/common/Text'
import RewardsByPosition from 'components/header/RewardsCenter/RewardsByPosition'
import RewardsByToken from 'components/header/RewardsCenter/RewardsByToken'
import { BN_ZERO } from 'constants/math'
import { ORACLE_DENOM } from 'constants/oracle'
import useAccountId from 'hooks/accounts/useAccountId'
import useAssets from 'hooks/assets/useAssets'
import useToggle from 'hooks/common/useToggle'
import useStakedAstroLpRewards from 'hooks/incentives/useStakedAstroLpRewards'
import useUnclaimedRewards from 'hooks/incentives/useUnclaimedRewards'
import useCurrentChainId from 'hooks/localStorage/useCurrentChainId'
import useRewardsCenterType from 'hooks/localStorage/useRewardsCenterType'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { ChainInfoID, RewardsCenterType } from 'types/enums'
import { getCoinValue } from 'utils/formatters'
import { mergeBNCoinArrays } from 'utils/helpers'

interface Props {
  className?: string
}
export default function RewardsCenter(props: Props) {
  const accountId = useAccountId()
  const [currentChainId, _] = useCurrentChainId()
  const [rewardsCenterType, setRewardCenterType] = useRewardsCenterType()
  const [showRewardsCenter, setShowRewardsCenter] = useToggle()
  const [isConfirming, setIsConfirming] = useState(false)
  const { data: unclaimedRewards } = useUnclaimedRewards()
  const { data: assets } = useAssets()
  const isNeutron = useMemo(
    () => currentChainId === ChainInfoID.Neutron1 || currentChainId === ChainInfoID.Pion1,
    [currentChainId],
  )

  const { data: stakedAstroLpRewards } = useStakedAstroLpRewards()
  const currentLpRewards = useMemo(() => {
    if (stakedAstroLpRewards.length === 0) return []
    return stakedAstroLpRewards[0].rewards
  }, [stakedAstroLpRewards])

  const rewards = useMemo(
    () => mergeBNCoinArrays(unclaimedRewards, currentLpRewards),
    [unclaimedRewards, currentLpRewards],
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
      accountId: accountId || '',
    })
    setIsConfirming(false)
  }, [accountId, claimRewards])

  useEffect(() => {
    if (!isNeutron) setRewardCenterType(RewardsCenterType.Token)
  }, [isNeutron, rewardsCenterType, setRewardCenterType])

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
        <div className='relative flex items-center h-fullx'>
          <DisplayCurrency coin={rewardsValueCoin} allowZeroAmount />
        </div>
      </Button>
      <Overlay
        className={'mt-2 right-0 top-8 w-[420px] flex flex-wrap'}
        show={showRewardsCenter}
        setShow={setShowRewardsCenter}
      >
        <div
          className={classNames(
            'flex h-[54px] w-full items-center justify-between bg-white/5 px-4 py-3',
            'border border-transparent border-b-white/10',
          )}
        >
          <Text size='lg' className='font-bold'>
            Rewards Center
          </Text>
        </div>
        <div className='flex flex-col w-full gap-4 px-4 py-5'>
          {isNeutron && (
            <SwitchWithText
              options={[
                { text: 'By Token', value: RewardsCenterType.Token },
                { text: 'By Position', value: RewardsCenterType.Position },
              ]}
              selected={rewardsCenterType}
              onChange={(value) => setRewardCenterType(value as RewardsCenterType)}
              name='rewardsCenterType'
              className='w-full'
            />
          )}
          <Text size='xs' className='w-full'>
            Total Rewards
          </Text>
          <div className='flex flex-wrap content-center justify-center w-full gap-1 p-4 rounded-md bg-black/20'>
            <DisplayCurrency coin={rewardsValueCoin} allowZeroAmount className='text-2xl' />
            <Text size='xs' className='w-full text-center text-white/60'>
              Unclaimed Rewards
            </Text>
          </div>
          <RewardsByToken
            rewards={rewards}
            assets={assets}
            active={rewardsCenterType === RewardsCenterType.Token || !isNeutron}
          />
          <RewardsByPosition
            redBankRewards={unclaimedRewards}
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
