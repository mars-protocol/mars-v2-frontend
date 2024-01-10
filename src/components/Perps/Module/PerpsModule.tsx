import { useState } from 'react'

import Card from 'components/Card'
import { LeverageButtons } from 'components/Perps/Module/LeverageButtons'
import { Or } from 'components/Perps/Module/Or'
import PerpsSummary from 'components/Perps/Module/Summary'
import RangeInput from 'components/RangeInput'
import { Spacer } from 'components/Spacer'
import Text from 'components/Text'
import AssetSelectorPerps from 'components/Trade/TradeModule/AssetSelector/AssetSelectorPerps'
import AssetAmountInput from 'components/Trade/TradeModule/SwapForm/AssetAmountInput'
import OrderTypeSelector from 'components/Trade/TradeModule/SwapForm/OrderTypeSelector'
import { AvailableOrderType } from 'components/Trade/TradeModule/SwapForm/OrderTypeSelector/types'
import { TradeDirectionSelector } from 'components/TradeDirectionSelector'
import { BN_ZERO } from 'constants/math'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import { BN } from 'utils/helpers'

export function PerpsModule() {
  const [selectedOrderType, setSelectedOrderType] = useState<AvailableOrderType>('Market')
  const [tradeDirection, setTradeDirection] = useState<TradeDirection>('long')
  const { perpsAsset } = usePerpsAsset()

  const [amount, setAmount] = useState<BigNumber>(BN_ZERO)

  if (!perpsAsset) return null

  return (
    <Card
      contentClassName='px-4 gap-5 flex flex-col h-full pb-4'
      title={<AssetSelectorPerps asset={perpsAsset} />}
      className='mb-4 h-full'
    >
      <OrderTypeSelector selected={selectedOrderType} onChange={setSelectedOrderType} />

      <TradeDirectionSelector direction={tradeDirection} onChangeDirection={setTradeDirection} />
      <AssetAmountInput
        label='Amount'
        max={BN(1000)} // TODO: Implement max calculation
        amount={amount}
        setAmount={setAmount}
        asset={perpsAsset}
        maxButtonLabel='Max:'
        disabled={false}
      />
      <Or />
      <Text size='sm'>Position Leverage</Text>
      <RangeInput max={0} value={0} onChange={() => {}} />
      <LeverageButtons />
      <Spacer />
      <PerpsSummary amount={amount} tradeDirection={tradeDirection} asset={perpsAsset} />
    </Card>
  )
}
