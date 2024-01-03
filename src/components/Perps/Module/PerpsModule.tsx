import { useState } from 'react'

import Button from 'components/Button'
import Card from 'components/Card'
import { DirectionSelect } from 'components/DirectionSelect'
import { LeverageButtons } from 'components/Perps/Module/LeverageButtons'
import { Or } from 'components/Perps/Module/Or'
import RangeInput from 'components/RangeInput'
import { Spacer } from 'components/Spacer'
import Text from 'components/Text'
import AssetSelectorPerps from 'components/Trade/TradeModule/AssetSelector/AssetSelectorPerps'
import AssetAmountInput from 'components/Trade/TradeModule/SwapForm/AssetAmountInput'
import OrderTypeSelector from 'components/Trade/TradeModule/SwapForm/OrderTypeSelector'
import { AvailableOrderType } from 'components/Trade/TradeModule/SwapForm/OrderTypeSelector/types'
import { BN_ZERO } from 'constants/math'
import useBaseAsset from 'hooks/assets/useBasetAsset'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'

export function PerpsModule() {
  const [selectedOrderType, setSelectedOrderType] = useState<AvailableOrderType>('Market')
  const [selectedOrderDirection, setSelectedOrderDirection] = useState<OrderDirection>('long')
  const baseAsset = useBaseAsset()
  const { perpsAsset } = usePerpsAsset()

  if (!perpsAsset) return null

  return (
    <Card
      contentClassName='px-4 gap-5 flex flex-col'
      title={<AssetSelectorPerps asset={perpsAsset} />}
      className='mb-4'
    >
      <OrderTypeSelector selected={selectedOrderType} onChange={setSelectedOrderType} />

      <DirectionSelect
        direction={selectedOrderDirection}
        onChangeDirection={setSelectedOrderDirection}
      />
      <AssetAmountInput
        label='Amount'
        max={BN_ZERO}
        amount={BN_ZERO}
        setAmount={() => {}}
        asset={baseAsset}
        maxButtonLabel='Max:'
        disabled={false}
      />
      <Or />
      <Text size='sm'>Position Leverage</Text>
      <RangeInput max={0} value={0} onChange={() => {}} />
      <LeverageButtons />
      <Spacer />
      <Button>{selectedOrderDirection} ETH</Button>
    </Card>
  )
}
