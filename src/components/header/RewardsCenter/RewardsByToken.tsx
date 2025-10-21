import AssetBalanceRow from 'components/common/assets/AssetBalanceRow'
import Text from 'components/common/Text'
import React from 'react'
import { byDenom } from 'utils/array'

interface Props {
  rewards: BNCoin[]
  assets: Asset[]
  active: boolean
}

export default function RewardsByToken(props: Props) {
  const { rewards, assets, active } = props

  if (rewards.length === 0 || !active) return null

  return (
    <React.Fragment>
      <Text size='xs' className='w-full'>
        Breakdown by Token
      </Text>
      <div className='flex flex-wrap w-full gap-2'>
        {rewards.map((reward) => {
          const asset = assets.find(byDenom(reward.denom))
          if (!asset) return null
          return (
            <AssetBalanceRow
              key={reward.denom}
              coin={reward}
              asset={asset}
              className='p-4 rounded-sm'
              small
            />
          )
        })}
      </div>
    </React.Fragment>
  )
}
