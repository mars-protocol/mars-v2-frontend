import { ArrowRight } from 'components/common/Icons'
import Text from 'components/common/Text'
import AssetBalanceRow from 'components/common/assets/AssetBalanceRow'

interface Props {
  changes: HlsClosingChanges['swap']
  collateralAsset: Asset
  debtAsset: Asset
}

export default function SwapInfo(props: Props) {
  const { changes, collateralAsset, debtAsset } = props

  if (!changes) return null
  return (
    <div className='flex flex-col w-full gap-2'>
      <Text className='mt-6' size='sm'>
        Swap
      </Text>
      <Text className='text-white/50' size='xs'>
        A part of the current position will be swapped to repay the borrowed funds
      </Text>
      <div className='flex items-center gap-2'>
        <AssetBalanceRow
          asset={collateralAsset}
          coin={changes.coinIn}
          className='p-2 rounded-md bg-white/5'
          hideNames
          small
        />
        <ArrowRight className='w-10 h-10 text-white' />
        <AssetBalanceRow
          asset={debtAsset}
          coin={changes.coinOut}
          className='p-2 rounded-md bg-white/5'
          hideNames
          small
        />
      </div>
    </div>
  )
}
