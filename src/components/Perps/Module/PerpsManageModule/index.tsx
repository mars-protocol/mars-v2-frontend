import classNames from 'classnames'
import { useState } from 'react'

import { Cross } from 'components/Icons'
import { LeverageButtons } from 'components/Perps/Module/LeverageButtons'
import { Or } from 'components/Perps/Module/Or'
import usePerpsManageModule from 'components/Perps/Module/PerpsManageModule/usePerpsManageModule'
import PerpsSummary from 'components/Perps/Module/Summary'
import RangeInput from 'components/RangeInput'
import { Spacer } from 'components/Spacer'
import Text from 'components/Text'
import AssetAmountInput from 'components/Trade/TradeModule/SwapForm/AssetAmountInput'
import { TradeDirectionSelector } from 'components/TradeDirectionSelector'
import { BN } from 'utils/helpers'

export function PerpsManageModule() {
  const [tradeDirection, setTradeDirection] = useState<TradeDirection | null>(null)
  const [amount, setAmount] = useState<BigNumber | null>(null)

  const {
    closeManagePerpModule,
    previousAmount,
    previousTradeDirection,
    previousLeverage,
    leverage,
    asset,
  } = usePerpsManageModule(amount)

  if (!asset) return null

  return (
    <div
      className={classNames(
        'px-4 gap-5 flex flex-col h-full pt-6 pb-4 w-full bg-white/5 absolute rounded-base isolate',
        'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-base before:p-[1px] before:border-glas',
      )}
    >
      <div className='flex justify-between mb-3'>
        <Text>Manage Position</Text>
        <button onClick={closeManagePerpModule} className='mr-1.5'>
          <Cross width={16} />
        </button>
      </div>
      <TradeDirectionSelector
        direction={tradeDirection ?? previousTradeDirection}
        onChangeDirection={setTradeDirection}
      />
      <AssetAmountInput
        label='Amount'
        max={BN(100000)} // TODO: Implement max calculation
        amount={amount ?? previousAmount}
        setAmount={setAmount}
        asset={asset}
        maxButtonLabel='Max:'
        disabled={false}
      />
      <Or />
      <Text size='sm'>Position Leverage</Text>
      <RangeInput max={0} value={0} onChange={() => {}} />
      <LeverageButtons />
      <Spacer />
      <PerpsSummary
        changeTradeDirection
        amount={amount ?? previousAmount}
        tradeDirection={tradeDirection ?? previousTradeDirection}
        asset={asset}
        leverage={leverage}
        previousAmount={previousAmount}
        previousTradeDirection={previousTradeDirection}
        previousLeverage={previousLeverage}
      />
    </div>
  )
}
