import AssetRate from 'components/common/assets/AssetRate'
import Loading from 'components/common/Loading'

export const APY_META = {
  accessorKey: 'apy.deposit',
  header: 'APY',
  meta: { className: 'min-w-20' },
}

interface Props {
  apy: number
  borrowEnabled: boolean
  isLoading: boolean
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
    />
  )
}
