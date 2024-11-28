import AssetImage from 'components/common/assets/AssetImage'
import Text from 'components/common/Text'

export default function Asset({ row }: { row: PerpsVaultRow }) {
  return (
    <div className='flex gap-2'>
      <AssetImage asset={row.asset} className='w-4 h-4' />
      <Text size='xs' className='text-white'>
        {row.asset?.symbol}
      </Text>
    </div>
  )
}
