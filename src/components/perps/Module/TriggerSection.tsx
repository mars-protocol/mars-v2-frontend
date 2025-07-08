import AssetAmountInput from 'components/common/AssetAmountInput'
import Button from 'components/common/Button'
import { Callout, CalloutType } from 'components/common/Callout'
import { TrashBin } from 'components/common/Icons'
import Text from 'components/common/Text'
import BigNumber from 'bignumber.js'
import { formatPercent } from 'utils/formatters'
import { PercentageButtons } from './PercentageButtons'

interface TriggerSectionProps {
  title: string
  assetSymbol: string
  triggerDescription: string
  infoText: string
  currentPrice: BigNumber
  triggerPrice: BigNumber
  setTriggerPrice: (price: BigNumber) => void
  triggerPercentage: BigNumber
  error?: string | null
  asset: Asset | null | undefined
  isShort: boolean
  isTakeProfit: boolean
  showTrigger: boolean
  setShowTrigger: (show: boolean) => void
  handleRemoveTrigger: () => void
  hasChildOrders?: boolean
}

const getTextColorClass = (percentage: BigNumber) => {
  if (percentage.isZero()) return 'text-white'
  if (percentage.isNegative()) return 'text-error'
  return 'text-success'
}

export const TriggerSection = ({
  title,
  assetSymbol,
  triggerDescription,
  infoText,
  currentPrice,
  triggerPrice,
  setTriggerPrice,
  triggerPercentage,
  error,
  asset,
  isShort,
  isTakeProfit,
  showTrigger,
  setShowTrigger,
  handleRemoveTrigger,
  hasChildOrders = false,
}: TriggerSectionProps) => {
  if (showTrigger && asset) {
    return (
      <>
        <Text size='lg' className='text-left'>
          {title}
        </Text>
        <Text size='xs' className='text-left text-white/60'>
          {triggerDescription}
        </Text>
        <div className='flex items-center gap-2'>
          <AssetAmountInput
            asset={asset}
            amount={triggerPrice}
            setAmount={setTriggerPrice}
            disabled={false}
            isUSD
          />
          <div className='flex flex-row flex-1 py-3 pl-3 pr-2 mt-2 border rounded border-white/20 bg-white/5'>
            <Text className={getTextColorClass(triggerPercentage)}>
              {formatPercent(triggerPercentage.toNumber())}
            </Text>
          </div>
        </div>
        <PercentageButtons
          currentPrice={currentPrice}
          setTargetPrice={setTriggerPrice}
          isShort={isShort}
          isTakeProfit={isTakeProfit}
        />
        {error && (
          <Callout type={CalloutType.WARNING} className='mt-2 text-left'>
            {error}
          </Callout>
        )}
        <Button
          onClick={handleRemoveTrigger}
          text='Remove trigger'
          color='secondary'
          leftIcon={<TrashBin className='self-center w-4 h-4 text-error' />}
          variant='transparent'
          textClassNames='text-error items-center'
          className='items-center self-start text-sm'
        />
      </>
    )
  }

  return (
    <>
      <Button
        onClick={() => setShowTrigger(true)}
        text={hasChildOrders ? `Add New ${title} Trigger` : `Add ${title} Trigger`}
        color='tertiary'
        className='w-full'
      />
      <Text size='sm' className='text-left text-white/60'>
        {infoText}
      </Text>
    </>
  )
}
