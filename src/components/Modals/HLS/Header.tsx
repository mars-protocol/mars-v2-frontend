import React from 'react'

import DoubleLogo from 'components/DoubleLogo'
import HLSTag from 'components/HLS/HLSTag'
import Text from 'components/Text'

interface Props {
  primaryAsset: Asset
  secondaryAsset: Asset
}

export default function Header(props: Props) {
  return (
    <div className='flex items-center gap-2'>
      <DoubleLogo
        primaryDenom={props.secondaryAsset.denom}
        secondaryDenom={props.primaryAsset.denom}
      />
      <Text>{`${props.secondaryAsset.symbol} - ${props.primaryAsset.symbol}`}</Text>
      <HLSTag />
    </div>
  )
}
