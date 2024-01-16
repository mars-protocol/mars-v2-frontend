import { useState } from 'react'

import Card from 'components/common/Card'
import { LeverageButtons } from 'components/perps/Module/LeverageButtons'
import { Or } from 'components/perps/Module/Or'
import PerpsSummary from 'components/perps/Module/Summary'
import RangeInput from 'components/common/RangeInput'
import { Spacer } from 'components/common/Spacer'
import Text from 'components/common/Text'
import AssetSelectorPerps from 'components/trade/TradeModule/AssetSelector/AssetSelectorPerps'
import AssetAmountInput from 'components/trade/TradeModule/SwapForm/AssetAmountInput'
import OrderTypeSelector from 'components/trade/TradeModule/SwapForm/OrderTypeSelector'
import { AvailableOrderType } from 'components/trade/TradeModule/SwapForm/OrderTypeSelector/types'
import { TradeDirectionSelector } from 'components/common/TradeDirectionSelector'
import { BN_ZERO } from 'constants/math'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import { BN } from 'utils/helpers'

export function PerpsModule() {
  const [selectedOrderType, setSelectedOrderType] = useState<AvailableOrderType>('Market')
  const [tradeDirection, setTradeDirection] = useState<TradeDirection>('long')
  const { perpsAsset } = usePerpsAsset()
  const [leverage, setLeverage] = useState<number>(1)

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
      <PerpsSummary
        amount={amount}
        tradeDirection={tradeDirection}
        asset={perpsAsset}
        leverage={leverage}
      />
    </Card>
  )
}
