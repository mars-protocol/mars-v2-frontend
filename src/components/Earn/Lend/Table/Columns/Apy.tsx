import AssetRate from 'components/Asset/AssetRate'
import Loading from 'components/Loading'

export const APY_META = { accessorKey: 'apy.deposit', header: 'APY', meta: { className: 'w-40' } }

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
