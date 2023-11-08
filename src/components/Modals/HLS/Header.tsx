import React from 'react'

import DoubleLogo from 'components/DoubleLogo'
import HLSTag from 'components/HLS/HLSTag'
import Text from 'components/Text'

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
