import Text from 'components/common/Text'
import React from 'react'
import RewardsPosition from './RewardsPosition'

interface Props {
  redBankRewards: BNCoin[]
  stakedAstroLpRewards: StakedAstroLpRewards[]
  active: boolean
  assets: Asset[]
}

export default function RewardsByPosition(props: Props) {
  const { redBankRewards, stakedAstroLpRewards, active, assets } = props

  if ((redBankRewards.length === 0 && stakedAstroLpRewards.length === 0) || !active) return null

  return (
    <React.Fragment>
      <Text size='xs' className='w-full'>
        Breakdown by Position
      </Text>
      <div className='flex flex-wrap w-full gap-2'>
        {redBankRewards.length > 0 && (
          <RewardsPosition denom='redbank' rewards={redBankRewards} assets={assets} />
        )}
        {stakedAstroLpRewards.map((stakedAstroLpReward) => (
          <RewardsPosition
            key={stakedAstroLpReward.lp_denom}
            denom={stakedAstroLpReward.lp_denom}
            rewards={stakedAstroLpReward.rewards}
            assets={assets}
          />
        ))}
      </div>
    </React.Fragment>
  )
}
