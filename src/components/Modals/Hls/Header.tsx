import DoubleLogo from 'components/common/DoubleLogo'
import Text from 'components/common/Text'
import HlsTag from 'components/hls/HlsTag'
import usePoolAssets from 'hooks/assets/usePoolAssets'
import { byDenom } from 'utils/array'

interface Props {
  primaryAsset: Asset
  secondaryAsset: Asset
  isFarming?: boolean
  action?: HlsStakingManageAction
  className?: string
}

export default function Header(props: Props) {
  const farmTokens = usePoolAssets()
  const primaryAsset = props.isFarming
    ? farmTokens.find(byDenom(props.primaryAsset.denom))?.poolInfo?.assets.primary
    : props.primaryAsset
  const secondaryAsset = props.isFarming
    ? farmTokens.find(byDenom(props.primaryAsset.denom))?.poolInfo?.assets.secondary
    : props.secondaryAsset

  if (!primaryAsset || !secondaryAsset) return null

  return (
    <div className='flex flex-wrap items-center gap-2 md:flex-nowrap pl-2 pr-2.5 py-3'>
      <DoubleLogo primaryDenom={primaryAsset.denom} secondaryDenom={secondaryAsset.denom} />
      {props.isFarming ? (
        <Text>{props.primaryAsset.symbol}</Text>
      ) : (
        <Text>{`${props.primaryAsset.symbol}/${props.secondaryAsset.symbol}`}</Text>
      )}
      {props.action && <Text className='capitalize'> - {props.action}</Text>}
      <HlsTag />
    </div>
  )
}
