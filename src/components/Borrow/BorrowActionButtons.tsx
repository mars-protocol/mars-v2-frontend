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
  const currentAsset = marketAssets.find((a) => a.denom === asset.denom)

  function actionHandler(isRepay: boolean) {
    if (!currentAsset) return null
    useStore.setState({ borrowModal: { asset: currentAsset, marketData: props.data, isRepay } })
  }

  return (
    <div className='flex flex-row space-x-2'>
      <Button
        leftIcon={debt ? <Plus /> : undefined}
        onClick={() => actionHandler(false)}
        color='secondary'
        text={debt ? 'Borrow more' : 'Borrow'}
        className='min-w-40 text-center'
      />
      {debt && <Button color='secondary' text='Repay' onClick={() => actionHandler(true)} />}
    </div>
  )
}
