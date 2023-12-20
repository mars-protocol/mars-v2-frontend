import { useState } from 'react'

import Button from 'components/Button'
import Card from 'components/Card'
import { DirectionSelect } from 'components/DirectionSelect'
import { ChevronDown } from 'components/Icons'
import { LeverageButtons } from 'components/Perps/Module/LeverageButtons'
import { Or } from 'components/Perps/Module/Or'
import RangeInput from 'components/RangeInput'
import { Spacer } from 'components/Spacer'
import Text from 'components/Text'
import AssetAmountInput from 'components/Trade/TradeModule/SwapForm/AssetAmountInput'
import OrderTypeSelector from 'components/Trade/TradeModule/SwapForm/OrderTypeSelector'
import { AvailableOrderType } from 'components/Trade/TradeModule/SwapForm/OrderTypeSelector/types'
import { BN_ZERO } from 'constants/math'
import useBaseAsset from 'hooks/assets/useBasetAsset'

export function PerpsModule() {
  const [selectedOrderType, setSelectedOrderType] = useState<AvailableOrderType>('Market')
  const [selectedOrderDirection, setSelectedOrderDirection] = useState<OrderDirection>('long')

  const baseAsset = useBaseAsset()
  return (
    <Card
      contentClassName='px-4 gap-5 flex flex-col'
      title={
        <div className='flex items-center justify-between py-4 pl-4 pr-2 bg-white/10'>
          <Text>
            ETH<span className='text-white/60'>/USD</span>
          </Text>
          <Button color='quaternary' variant='transparent' rightIcon={<ChevronDown />}>
            All Markets
          </Button>
        </div>
      }
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
