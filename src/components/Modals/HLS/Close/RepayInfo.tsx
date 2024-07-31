import Text from 'components/common/Text'
import AssetBalanceRow from 'components/common/assets/AssetBalanceRow'

interface Props {
  repayCoin: BNCoin | null
  debtAsset: Asset
}

export default function RepayInfo(props: Props) {
  const { repayCoin, debtAsset } = props

  if (!repayCoin) return null
  return (
    <div className='flex flex-col w-full gap-2'>
      <Text className='mt-6' size='sm'>
        Repay
      </Text>
      <Text className='text-white/50' size='xs'>
        To bring the leverage down to 1x, the borrowed funds will be repaid
      </Text>
      <AssetBalanceRow
        asset={debtAsset}
        coin={repayCoin}
        className='p-2 rounded-md bg-white/5'
        hideNames
        small
      />
    </div>
  )
}
