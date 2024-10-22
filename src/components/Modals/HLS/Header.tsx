import DoubleLogo from 'components/common/DoubleLogo'
import Text from 'components/common/Text'
import HLSTag from 'components/hls/HLSTag'

interface Props {
  primaryAsset: Asset
  secondaryAsset: Asset
  action?: HlsStakingManageAction
  className?: string
}

export default function Header(props: Props) {
  return (
    <div className='flex flex-wrap items-center gap-2 md:flex-nowrap pl-2 pr-2.5 py-3'>
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
