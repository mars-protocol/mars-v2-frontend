import { useParams } from 'react-router-dom'

import useAssets from 'hooks/assets/useAssets'
import { bySymbol } from 'utils/array'
import Text from 'components/common/Text'

export default function AssetDetailPage() {
  const { symbol } = useParams<{ symbol: string }>()
  const { data: assets } = useAssets()
  const asset = symbol ? assets?.find(bySymbol(symbol)) : undefined

  if (!asset) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Text size='lg'>Asset not found</Text>
      </div>
    )
  }

  return (
    <div className='flex flex-wrap w-full gap-2 py-8'>
      <div className='w-full'>
        <Text size='xl'>{asset.symbol}</Text>
      </div>
    </div>
  )
}
