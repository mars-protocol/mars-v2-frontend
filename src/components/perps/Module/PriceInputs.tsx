import { Callout } from 'components/common/Callout'
import Divider from 'components/common/Divider'
import LimitPriceInput from 'components/common/LimitPriceInput'

export const LimitPriceSection = ({
  USD,
  limitPrice,
  setLimitPrice,
  limitPriceInfo,
}: {
  USD: any
  limitPrice: BigNumber
  setLimitPrice: (price: BigNumber) => void
  limitPriceInfo: CallOut | undefined
}) => {
  if (!USD) return null

  return (
    <>
      <LimitPriceInput
        asset={USD}
        label='Limit Price'
        amount={limitPrice}
        setAmount={setLimitPrice}
        disabled={false}
      />
      {limitPriceInfo && <Callout type={limitPriceInfo.type}>{limitPriceInfo.message}</Callout>}
      <Divider />
    </>
  )
}

export const StopPriceSection = ({
  USD,
  stopPrice,
  setStopPrice,
  stopPriceInfo,
}: {
  USD: any
  stopPrice: BigNumber
  setStopPrice: (price: BigNumber) => void
  stopPriceInfo: CallOut | undefined
}) => {
  if (!USD) return null

  return (
    <>
      <LimitPriceInput
        asset={USD}
        amount={stopPrice}
        setAmount={setStopPrice}
        disabled={false}
        label='Stop Price'
      />
      {stopPriceInfo && <Callout type={stopPriceInfo.type}>{stopPriceInfo.message}</Callout>}
      <Divider />
    </>
  )
}
