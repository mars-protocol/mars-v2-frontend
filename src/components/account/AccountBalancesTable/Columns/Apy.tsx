import classNames from 'classnames'

import AssetRate from 'components/common/assets/AssetRate'
import Loading from 'components/common/Loading'
import Text from 'components/common/Text'

export const APY_META = { accessorKey: 'apy', header: 'APY', meta: { className: 'w-30 pr-4' } }

interface Props {
  apy?: number | null
  markets: Market[]
  denom: string
  type: PositionType
}

export default function Apr(props: Props) {
  const { markets, type, denom, apy } = props

  if (apy === undefined) return <Loading />
  if (apy === null) return <Text size='xs'>N/A</Text>

  if (apy === 0)
    return (
      <p className={classNames('w-full text-xs text-right number', type === 'vault' && 'pb-4')}>
        &ndash;
      </p>
    )

  const isEnabled =
    markets.find((market) => market.asset.denom === props.denom)?.borrowEnabled ?? false

  return (
    <AssetRate
      className={classNames('justify-end text-xs', type === 'vault' && 'pb-4')}
      rate={apy}
      isEnabled={type !== 'lend' || isEnabled}
      type='apy'
      orientation='ltr'
    />
  )
}
