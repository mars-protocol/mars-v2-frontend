import { CircularProgress } from 'components/common/CircularProgress'
import Text from 'components/common/Text'

export default function AssetSelectorItemLoading() {
  return (
    <li className='relative flex items-center justify-center w-full gap-2 p-4 border-b border-white/10 z-1'>
      <CircularProgress />
      <Text size='sm'>Loading...</Text>
    </li>
  )
}
