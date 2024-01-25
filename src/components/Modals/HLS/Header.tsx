import React from 'react'

import DoubleLogo from 'components/common/DoubleLogo'
import HLSTag from 'components/hls/HLSTag'
import Text from 'components/common/Text'

interface Props {
  primaryAsset: Asset
  secondaryAsset: Asset
  action?: HlsStakingManageAction
}

export default function Header(props: Props) {
  return (
    <div className='flex items-center gap-2'>
      <DoubleLogo
        primaryDenom={props.primaryAsset.denom}
        secondaryDenom={props.secondaryAsset.denom}
      />
      <Text>{`${props.primaryAsset.symbol}/${props.secondaryAsset.symbol}`}</Text>
      {props.action && <Text className='capitalize'> - {props.action}</Text>}
      <HLSTag />
    </div>
  )
}
