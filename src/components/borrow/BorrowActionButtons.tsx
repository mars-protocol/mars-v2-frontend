import { useCallback } from 'react'

import Button from 'components/common/Button'
import ActionButton from 'components/common/Button/ActionButton'
import { HandCoins, Plus } from 'components/common/Icons'
import useMarketEnabledAssets from 'hooks/assets/useMarketEnabledAssets'
import useStore from 'store'

interface Props {
  data: BorrowMarketTableData
}

export default function BorrowActionButtons(props: Props) {
  const { asset, debt } = props.data
  const marketAssets = useMarketEnabledAssets()
  const currentAsset = marketAssets.find((a) => a.denom === asset.denom)

  const borrowHandler = useCallback(() => {
    if (!currentAsset) return null
    useStore.setState({ borrowModal: { asset: currentAsset, marketData: props.data } })
  }, [currentAsset, props.data])

  const repayHandler = useCallback(() => {
    if (!currentAsset) return null
    useStore.setState({
      borrowModal: { asset: currentAsset, marketData: props.data, isRepay: true },
    })
  }, [currentAsset, props.data])

  return (
    <div className='flex flex-row space-x-2'>
      <ActionButton
        leftIcon={<Plus className='w-3' />}
        onClick={borrowHandler}
        color='secondary'
        text={debt ? 'Borrow more' : 'Borrow'}
        className='min-w-40 text-center'
      />
      {debt && (
        <Button color='tertiary' leftIcon={<HandCoins />} text='Repay' onClick={repayHandler} />
      )}
    </div>
  )
}