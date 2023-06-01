import BigNumber from 'bignumber.js'
import { useState } from 'react'

import Button from 'components/Button'
import DisplayCurrency from 'components/DisplayCurrency'
import Divider from 'components/Divider'
import { ArrowRight, ExclamationMarkCircled } from 'components/Icons'
import Slider from 'components/Slider'
import Switch from 'components/Switch'
import Text from 'components/Text'
import TokenInput from 'components/TokenInput'
import usePrice from 'hooks/usePrice'
import { getAmount } from 'utils/accounts'
import { BN } from 'utils/helpers'
import { Gauge } from 'components/Gauge'
import useStore from 'store'

interface Props {
  primaryAmount: BigNumber
  secondaryAmount: BigNumber
  primaryAsset: Asset
  secondaryAsset: Asset
  account: Account
  isCustomRatio: boolean
  onChangeIsCustomRatio: (isCustomRatio: boolean) => void
  onChangePrimaryAmount: (amount: BigNumber) => void
  onChangeSecondaryAmount: (amount: BigNumber) => void
  toggleOpen: (index: number) => void
}

export default function VaultDeposit(props: Props) {
  const baseCurrency = useStore((s) => s.baseCurrency)

  const availablePrimaryAmount = getAmount(props.primaryAsset.denom, props.account.deposits)
  const availableSecondaryAmount = getAmount(props.secondaryAsset.denom, props.account.deposits)
  const primaryPrice = usePrice(props.primaryAsset.denom)
  const secondaryPrice = usePrice(props.secondaryAsset.denom)

  const primaryValue = props.primaryAmount.times(primaryPrice)
  const secondaryValue = props.secondaryAmount.times(secondaryPrice)
  const totalValue = primaryValue.plus(secondaryValue)

  const primaryValuePercentage = primaryValue.isEqualTo(secondaryValue)
    ? 50
    : primaryValue.div(totalValue).times(100).decimalPlaces(2).toNumber()
  const secondaryValuePercentage = primaryValue.isEqualTo(secondaryValue)
    ? 50
    : new BigNumber(100).minus(primaryValuePercentage).decimalPlaces(2).toNumber()

  const maxAssetValueNonCustom = BN(
    Math.min(
      availablePrimaryAmount.times(primaryPrice).toNumber(),
      availableSecondaryAmount.times(secondaryPrice).toNumber(),
    ),
  )
  const primaryMax = props.isCustomRatio
    ? availablePrimaryAmount
    : maxAssetValueNonCustom.dividedBy(primaryPrice)
  const secondaryMax = props.isCustomRatio
    ? availableSecondaryAmount
    : maxAssetValueNonCustom.dividedBy(secondaryPrice)

  const [percentage, setPercentage] = useState(
    primaryValue.dividedBy(maxAssetValueNonCustom).times(100).decimalPlaces(0).toNumber(),
  )
  const disableInput =
    (availablePrimaryAmount.isZero() || availableSecondaryAmount.isZero()) && !props.isCustomRatio

  function handleSwitch() {
    const isCustomRatioNew = !props.isCustomRatio
    if (!isCustomRatioNew) {
      props.onChangePrimaryAmount(BN(0))
      props.onChangeSecondaryAmount(BN(0))
      setPercentage(0)
    }
    props.onChangeIsCustomRatio(isCustomRatioNew)
  }

  function onChangePrimaryDeposit(amount: BigNumber) {
    if (amount.isGreaterThan(primaryMax)) {
      amount = primaryMax
    }
    props.onChangePrimaryAmount(amount)
    setPercentage(amount.dividedBy(primaryMax).times(100).decimalPlaces(0).toNumber())
    if (!props.isCustomRatio) {
      props.onChangeSecondaryAmount(secondaryMax.multipliedBy(amount.dividedBy(primaryMax)))
    }
  }

  function onChangeSecondaryDeposit(amount: BigNumber) {
    if (amount.isGreaterThan(secondaryMax)) {
      amount = secondaryMax
    }
    props.onChangeSecondaryAmount(amount)
    setPercentage(amount.dividedBy(primaryMax).times(100).decimalPlaces(0).toNumber())
    if (!props.isCustomRatio) {
      props.onChangePrimaryAmount(primaryMax.multipliedBy(amount.dividedBy(secondaryMax)))
    }
  }

  function onChangeSlider(value: number) {
    setPercentage(value)
    props.onChangePrimaryAmount(primaryMax.multipliedBy(value / 100))
    props.onChangeSecondaryAmount(secondaryMax.multipliedBy(value / 100))
  }

  function getWarningText(asset: Asset) {
    return `You don't have ${asset.symbol} balance in your account. Toggle custom amount to deposit.`
  }

  return (
    <div className='flex flex-col'>
      <div className='flex gap-4 p-4'>
        <div className='flex flex-col items-center justify-between gap-1 pb-[30px] pt-2'>
          <Gauge
            percentage={primaryValuePercentage}
            tooltip={`${primaryValuePercentage}% of value is ${props.primaryAsset.symbol}`}
            labelClassName='text-martian-red'
            diameter={32}
            strokeColor='#FF645F'
            strokeWidth={3}
          />
          <div className='h-full w-[1px] rounded-xl bg-white/10'></div>
          <Gauge
            percentage={secondaryValuePercentage}
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
            amount={props.primaryAmount}
            max={availablePrimaryAmount}
            maxText='Balance'
            asset={props.primaryAsset}
            warning={
              availablePrimaryAmount.isZero() ? getWarningText(props.primaryAsset) : undefined
            }
            disabled={disableInput}
          />
          {!props.isCustomRatio && (
            <Slider value={percentage} onChange={onChangeSlider} disabled={disableInput} />
          )}
          <TokenInput
            onChange={onChangeSecondaryDeposit}
            amount={props.secondaryAmount}
            max={availableSecondaryAmount}
            maxText='Balance'
            asset={props.secondaryAsset}
            warning={
              availableSecondaryAmount.isZero() ? getWarningText(props.secondaryAsset) : undefined
            }
            disabled={disableInput}
          />
        </div>
      </div>
      <div className='flex flex-col gap-6 p-4 pt-2'>
        {disableInput ? (
          <div>
            <Divider />
            <div className='flex items-center gap-4 py-4'>
              <div className='w-5'>
                <ExclamationMarkCircled className='w-5 gap-3 text-white' />
              </div>
              <Text size='xs'>
                You currently have little to none of one asset. Toggle custom ratio to supply your
                assets asymmetrically.
              </Text>
            </div>
            <Divider />
          </div>
        ) : (
          <Divider />
        )}

        <div className='flex justify-between'>
          <Text className='text-white/50'>Custom ratio</Text>
          <Switch checked={props.isCustomRatio} onChange={handleSwitch} name='customRatio' />
        </div>
        <div className='flex justify-between'>
          <Text className='text-white/50'>{`${props.primaryAsset.symbol}-${props.secondaryAsset.symbol} Deposit Value`}</Text>
          <DisplayCurrency coin={{ denom: baseCurrency.denom, amount: totalValue.toString() }} />
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
