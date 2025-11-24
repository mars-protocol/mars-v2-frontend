import AssetRate from 'components/common/assets/AssetRate'
import Loading from 'components/common/Loading'

export const APY_META = {
  id: 'apy',
  accessorKey: 'apy.deposit',
  header: 'APY',
  meta: { className: 'w-24' },
}

interface Props {
  apy: number
  borrowEnabled: boolean
  isLoading: boolean
  hasCampaignApy?: boolean
}
export default function Apr(props: Props) {
  if (props.isLoading) return <Loading />

  return (
    <AssetRate
      rate={props.apy ?? 0}
      isEnabled={props.borrowEnabled}
      className='justify-end text-xs'
      type='apy'
      orientation='ltr'
      hasCampaignApy={props.hasCampaignApy}
    />
  )
}
