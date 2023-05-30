import BigNumber from 'bignumber.js'
import { useState } from 'react'

import Button from 'components/Button'
import Divider from 'components/Divider'
import { FormattedNumber } from 'components/FormattedNumber'
import { ArrowRight } from 'components/Icons'
import Slider from 'components/Slider'
import Switch from 'components/Switch'
import Text from 'components/Text'
import TokenInput from 'components/TokenInput'
import usePrice from 'hooks/usePrice'
import { getAmount } from 'utils/accounts'
import { BN } from 'utils/helpers'
import { Gauge } from 'components/Gauge'

interface Props {
  primaryAsset: Asset
  secondaryAsset: Asset
  account: Account
  onChangeDeposits: (deposits: Map<string, BigNumber>) => void
  toggleOpen: (index: number) => void
}

export default function VaultDeposit(props: Props) {
  const [isCustomAmount, setIsCustomAmount] = useState(false)
  const [percentage, setPercentage] = useState(0)
  const [primaryAmount, setPrimaryAmount] = useState<BigNumber>(BN(0))
  const [secondaryAmount, setSecondaryAmount] = useState<BigNumber>(BN(0))

  const availablePrimaryAmount = getAmount(props.primaryAsset.denom, props.account.deposits)
  const availableSecondaryAmount = getAmount(props.secondaryAsset.denom, props.account.deposits)
  const primaryPrice = usePrice(props.primaryAsset.denom)
  const secondaryPrice = usePrice(props.secondaryAsset.denom)

  const primaryValue = primaryAmount.times(primaryPrice)
  const secondaryValue = secondaryAmount.times(secondaryPrice)
  const totalValue = primaryValue.plus(secondaryValue)
  const primaryValuePercentage = primaryValue.isEqualTo(secondaryValue)
    ? 0.5
    : primaryValue.div(totalValue).toNumber()
  const secondaryValuePercentage = secondaryValue.isEqualTo(primaryValue)
    ? 0.5
    : secondaryValue.div(totalValue).toNumber()

  const maxAssetValueNonCustom = BN(
    Math.min(availablePrimaryAmount.toNumber(), availableSecondaryAmount.toNumber()),
  )
  const primaryMax = isCustomAmount
    ? availablePrimaryAmount
    : maxAssetValueNonCustom.dividedBy(primaryPrice)
  const secondaryMax = isCustomAmount
    ? availableSecondaryAmount
    : maxAssetValueNonCustom.dividedBy(secondaryPrice)

  function handleSwitch() {
    const isCustomAmountNew = !isCustomAmount
    if (!isCustomAmountNew) {
      setPrimaryAmount(BN(0))
      setSecondaryAmount(BN(0))
      setPercentage(0)
    }
    setIsCustomAmount(isCustomAmountNew)
  }

  function onChangePrimaryDeposit(amount: BigNumber) {
    setPrimaryAmount(amount)
    if (!isCustomAmount) {
      setSecondaryAmount(secondaryMax.multipliedBy(amount.dividedBy(primaryMax)))
    }
  }

  function onChangeSecondaryDeposit(amount: BigNumber) {
    setSecondaryAmount(amount)
    if (!isCustomAmount) {
      setPrimaryAmount(primaryMax.multipliedBy(amount.dividedBy(secondaryMax)))
    }
  }

  function onChangeSlider(value: number) {
    setPercentage(value)
    setPrimaryAmount(primaryMax.multipliedBy(value / 100))
    setSecondaryAmount(secondaryMax.multipliedBy(value / 100))
  }

  function getWarningText(asset: Asset) {
    return `You don't have ${asset.symbol} balance in your account. Toggle custom amount to deposit.`
  }

  return (
    <div className='flex flex-col'>
      <div className='flex gap-4 p-4'>
        <div className='flex flex-col items-center justify-between gap-1 pb-[30px] pt-2'>
          <Gauge
            value={primaryValuePercentage}
            tooltip={`${primaryValuePercentage}% of value is ${props.primaryAsset.symbol}`}
            labelClassName='text-martian-red'
            diameter={32}
            strokeColor='#FF645F'
            strokeWidth={3}
          />
          <div className='h-full w-[1px] rounded-xl bg-white/10'></div>
          <Gauge
            value={secondaryValuePercentage}
            tooltip={`${secondaryValuePercentage}% of value is ${props.secondaryAsset.symbol}`}
            labelClassName='text-martian-red'
            diameter={32}
            strokeColor='#FF645F'
            strokeWidth={3}
          />
        </div>
        <div className='flex h-full flex-grow flex-col justify-between gap-6'>
          <TokenInput
            onChange={onChangePrimaryDeposit}
            amount={primaryAmount}
            max={availablePrimaryAmount}
            maxText='Balance'
            asset={props.primaryAsset}
            warning={primaryMax.isZero() ? getWarningText(props.primaryAsset) : undefined}
          />
          {!isCustomAmount && <Slider value={percentage} onChange={onChangeSlider} />}
          <TokenInput
            onChange={onChangeSecondaryDeposit}
            amount={secondaryAmount}
            max={availableSecondaryAmount}
            maxText='Balance'
            asset={props.secondaryAsset}
            warning={secondaryMax.isZero() ? getWarningText(props.secondaryAsset) : undefined}
          />
        </div>
      </div>
      <div className='flex flex-col gap-6 p-4'>
        <Divider />
        <div className='flex justify-between'>
          <Text className='text-white/50'>Custom amount</Text>
          <Switch checked={isCustomAmount} onChange={handleSwitch} name='customAmount' />
        </div>
        <div className='flex justify-between'>
          <Text className='text-white/50'>{`${props.primaryAsset.symbol}-${props.secondaryAsset.symbol} Position Value`}</Text>
          <FormattedNumber amount={0} options={{ prefix: '$' }} />
        </div>
        <Button
          onClick={() => props.toggleOpen(1)}
          className='w-full'
          text='Continue'
          rightIcon={<ArrowRight />}
        />
      </div>
    </div>
  )
}
