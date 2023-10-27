import React from 'react'

import DoubleLogo from 'components/DoubleLogo'
import Text from 'components/Text'
import { getAssetByDenom } from 'utils/assets'

interface Props {
  primaryDenom: string
  secondaryDenom: string
}

export default function Header(props: Props) {
  const primaryAsset = getAssetByDenom(props.primaryDenom)
  const secondaryAsset = getAssetByDenom(props.secondaryDenom)

  if (!primaryAsset || !secondaryAsset) return null

  return (
    <span className='flex items-center gap-2'>
      <DoubleLogo primaryDenom={props.primaryDenom} secondaryDenom={props.secondaryDenom} />
      <Text>{`${primaryAsset.symbol} - ${secondaryAsset.symbol}`}</Text>
      <Text className='rounded-sm gradient-hls px-2 font-bold py-0.5' size='xs'>
        HLS
      </Text>
    </span>
  )
}
