import BigNumber from 'bignumber.js'
import { useMemo, useState } from 'react'

import Button from 'components/Button'
import DisplayCurrency from 'components/DisplayCurrency'
import Divider from 'components/Divider'
import { Gauge } from 'components/Gauge'
import { ArrowRight, ExclamationMarkCircled } from 'components/Icons'
import Slider from 'components/Slider'
import Switch from 'components/Switch'
import Text from 'components/Text'
import TokenInput from 'components/TokenInput'
import usePrice from 'hooks/usePrice'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { getAmount } from 'utils/accounts'
import { BN } from 'utils/helpers'
import { findCoinByDenom } from 'utils/assets'

interface Props {
  deposits: BNCoin[]
  primaryAsset: Asset
  secondaryAsset: Asset
  account: Account
  isCustomRatio: boolean
  onChangeDeposits: (deposits: BNCoin[]) => void
  onChangeIsCustomRatio: (isCustomRatio: boolean) => void
  toggleOpen: (index: number) => void
}

export default function VaultDeposit(props: Props) {
  const { deposits, primaryAsset, secondaryAsset, account, onChangeDeposits } = props
  const baseCurrency = useStore((s) => s.baseCurrency)
  const availablePrimaryAmount = getAmount(primaryAsset.denom, account.deposits)
  const availableSecondaryAmount = getAmount(secondaryAsset.denom, account.deposits)
  const primaryPrice = usePrice(primaryAsset.denom)
  const secondaryPrice = usePrice(secondaryAsset.denom)

  const primaryCoin = useMemo(() => {
    const amount = findCoinByDenom(primaryAsset.denom, deposits)?.amount.toString() || '0'
    return new BNCoin({ denom: primaryAsset.denom, amount })
  }, [deposits, primaryAsset.denom])

  const secondaryCoin = useMemo(() => {
    const amount = findCoinByDenom(secondaryAsset.denom, deposits)?.amount.toString() || '0'
    return new BNCoin({ denom: secondaryAsset.denom, amount })
  }, [deposits, secondaryAsset.denom])

  const primaryValue = useMemo(
    () => primaryCoin.amount.multipliedBy(primaryPrice),
    [primaryCoin, primaryPrice],
  )
  const secondaryValue = useMemo(
    () => secondaryCoin.amount.multipliedBy(secondaryPrice),
    [secondaryCoin, secondaryPrice],
  )
  const totalValue = useMemo(
    () => primaryValue.plus(secondaryValue),
    [primaryValue, secondaryValue],
  )

  const primaryValuePercentage = useMemo(() => {
    const value = primaryValue.dividedBy(totalValue).multipliedBy(100).decimalPlaces(2).toNumber()
    return isNaN(value) ? 50 : value
  }, [primaryValue, totalValue])
  const secondaryValuePercentage = useMemo(
    () => new BigNumber(100).minus(primaryValuePercentage).integerValue(2).toNumber() ?? 50,
    [primaryValuePercentage],
  )

  const maxAssetValueNonCustom = useMemo(
    () =>
      BN(
        Math.min(
          availablePrimaryAmount.multipliedBy(primaryPrice).toNumber(),
          availableSecondaryAmount.multipliedBy(secondaryPrice).toNumber(),
        ),
      ),
    [availablePrimaryAmount, primaryPrice, availableSecondaryAmount, secondaryPrice],
  )
  const primaryMax = useMemo(
    () =>
      props.isCustomRatio
        ? availablePrimaryAmount
        : maxAssetValueNonCustom.dividedBy(primaryPrice).integerValue(),
    [props.isCustomRatio, availablePrimaryAmount, primaryPrice, maxAssetValueNonCustom],
  )
  const secondaryMax = useMemo(
    () =>
      props.isCustomRatio
        ? availableSecondaryAmount
        : maxAssetValueNonCustom.dividedBy(secondaryPrice).decimalPlaces(0),
    [props.isCustomRatio, availableSecondaryAmount, secondaryPrice, maxAssetValueNonCustom],
  )

  const [percentage, setPercentage] = useState(
    primaryValue.dividedBy(maxAssetValueNonCustom).multipliedBy(100).decimalPlaces(0).toNumber() ||
      0,
  )
  const disableInput =
    (availablePrimaryAmount.isZero() || availableSecondaryAmount.isZero()) && !props.isCustomRatio

  function handleSwitch() {
    const isCustomRatioNew = !props.isCustomRatio
    if (!isCustomRatioNew) {
      primaryCoin.amount = BN(0)
      secondaryCoin.amount = BN(0)
      onChangeDeposits([primaryCoin, secondaryCoin])
      setPercentage(0)
    }
    props.onChangeIsCustomRatio(isCustomRatioNew)
  }

  function onChangePrimaryDeposit(amount: BigNumber) {
    if (amount.isGreaterThan(primaryMax)) {
      amount = primaryMax
    }
    primaryCoin.amount = amount
    setPercentage(amount.dividedBy(primaryMax).multipliedBy(100).decimalPlaces(0).toNumber())
    if (!props.isCustomRatio) {
      secondaryCoin.amount = secondaryMax.multipliedBy(amount.dividedBy(primaryMax)).integerValue()
    }

    onChangeDeposits([primaryCoin, secondaryCoin])
  }

  function onChangeSecondaryDeposit(amount: BigNumber) {
    if (amount.isGreaterThan(secondaryMax)) {
      amount = secondaryMax
    }
    secondaryCoin.amount = amount
    setPercentage(amount.dividedBy(secondaryMax).multipliedBy(100).decimalPlaces(0).toNumber())
    if (!props.isCustomRatio) {
      primaryCoin.amount = primaryMax.multipliedBy(amount.dividedBy(secondaryMax)).integerValue()
    }

    onChangeDeposits([primaryCoin, secondaryCoin])
  }

  function onChangeSlider(value: number) {
    setPercentage(value)
    primaryCoin.amount = primaryMax.multipliedBy(value / 100).integerValue()
    secondaryCoin.amount = secondaryMax.multipliedBy(value / 100).integerValue()
    onChangeDeposits([primaryCoin, secondaryCoin])
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
            tooltip={`${primaryValuePercentage}% of value is ${primaryAsset.symbol}`}
            labelClassName='text-martian-red'
            diameter={32}
            strokeColor='#FF645F'
            strokeWidth={3}
          />
          <div className='h-full w-[1px] rounded-xl bg-white/10'></div>
          <Gauge
            percentage={secondaryValuePercentage}
            tooltip={`${secondaryValuePercentage}% of value is ${secondaryAsset.symbol}`}
            labelClassName='text-martian-red'
            diameter={32}
            strokeColor='#FF645F'
            strokeWidth={3}
          />
        </div>
        <div className='flex h-full flex-1 flex-col justify-between gap-6'>
          <TokenInput
            onChange={onChangePrimaryDeposit}
            amount={primaryCoin.amount}
            max={availablePrimaryAmount}
            maxText='Balance'
            asset={primaryAsset}
            warning={availablePrimaryAmount.isZero() ? getWarningText(primaryAsset) : undefined}
            disabled={disableInput}
          />
          {!props.isCustomRatio && (
            <Slider value={percentage} onChange={onChangeSlider} disabled={disableInput} />
          )}
          <TokenInput
            onChange={onChangeSecondaryDeposit}
            amount={secondaryCoin.amount}
            max={availableSecondaryAmount}
            maxText='Balance'
            asset={secondaryAsset}
            warning={availableSecondaryAmount.isZero() ? getWarningText(secondaryAsset) : undefined}
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
          <Text className='text-white/50'>{`${primaryAsset.symbol}-${secondaryAsset.symbol} Deposit Value`}</Text>
          <DisplayCurrency
            coin={new BNCoin({ denom: baseCurrency.denom, amount: totalValue.toString() })}
          />
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
