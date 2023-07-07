import Button from 'components/Button'
import { Plus } from 'components/Icons'
import useStore from 'store'
import { getEnabledMarketAssets } from 'utils/assets'

interface Props {
  data: BorrowMarketTableData
}

export default function BorrowActionButtons(props: Props) {
  const { asset, debt } = props.data
  const marketAssets = getEnabledMarketAssets()
  const currentAsset = marketAssets.find((asset) => asset.denom === asset.denom)

  function borrowHandler() {
    if (!currentAsset) return null
    useStore.setState({ borrowModal: { asset: currentAsset, marketData: props.data } })
  }

  function repayHandler() {
    if (!currentAsset) return null
    useStore.setState({
      borrowModal: { asset: currentAsset, marketData: props.data, isRepay: true },
    })
  }

  return (
    <div className='flex flex-row space-x-2'>
      <Button
        leftIcon={debt ? <Plus /> : undefined}
        onClick={borrowHandler}
        color='secondary'
        text={debt ? 'Borrow more' : 'Borrow'}
        className='min-w-40 text-center'
      />
      {debt && <Button color='secondary' text='Repay' onClick={repayHandler} />}
    </div>
  )
}
