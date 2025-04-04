import { Or } from 'components/perps/Module/Or'
import Text from 'components/common/Text'
import LeverageSlider from 'components/common/LeverageSlider'
import { LeverageButtons } from 'components/perps/Module/LeverageButtons'
import { BigNumber } from 'bignumber.js'

interface LeverageSectionProps {
  maxLeverage: number
  effectiveLeverage: number
  onChangeLeverage: (leverage: number) => void
  tradeDirection: TradeDirection
  isDisabledAmountInput: boolean
  maxAmount: BigNumber
}

export const LeverageSection = ({
  maxLeverage,
  effectiveLeverage,
  onChangeLeverage,
  tradeDirection,
  isDisabledAmountInput,
  maxAmount,
}: LeverageSectionProps) => (
  <div className='w-full'>
    <Or />
    <Text size='sm' className='mt-5 mb-2'>
      Position Leverage
    </Text>
    <LeverageSlider
      max={maxLeverage}
      value={effectiveLeverage > maxLeverage ? 0 : effectiveLeverage}
      onChange={onChangeLeverage}
      type={tradeDirection}
      disabled={isDisabledAmountInput || effectiveLeverage > maxLeverage}
    />
    {maxLeverage > 5 && (
      <LeverageButtons
        maxLeverage={maxLeverage}
        currentLeverage={effectiveLeverage > maxLeverage ? 0 : effectiveLeverage}
        maxAmount={maxAmount}
        onChange={onChangeLeverage}
      />
    )}
  </div>
)
