import BigNumber from 'bignumber.js'
import { useState } from 'react'

import { Button } from 'components/Button'
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
  const [deposits, setDeposits] = useState<Map<string, BigNumber>>(new Map())

  const availablePrimaryAmount = getAmount(props.primaryAsset.denom, props.account.deposits)
  const availableSecondaryAmount = getAmount(props.secondaryAsset.denom, props.account.deposits)
  const primaryPrice = usePrice(props.primaryAsset.denom)
  const secondaryPrice = usePrice(props.secondaryAsset.denom)

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
      setDeposits((deposits) => {
        deposits.clear()
        return new Map(deposits)
      })
      setPercentage(0)
    }
    setIsCustomAmount(isCustomAmountNew)
  }

  function onChangePrimaryDeposit(amount: BigNumber) {
    onChangeDeposit(props.primaryAsset.denom, amount)
    if (!isCustomAmount) {
      onChangeDeposit(
        props.secondaryAsset.denom,
        secondaryMax.multipliedBy(amount.dividedBy(primaryMax)),
      )
    }
  }

  function onChangeSecondaryDeposit(amount: BigNumber) {
    onChangeDeposit(props.secondaryAsset.denom, amount)
    if (!isCustomAmount) {
      onChangeDeposit(
        props.primaryAsset.denom,
        primaryMax.multipliedBy(amount.dividedBy(secondaryMax)),
      )
    }
  }

  function onChangeDeposit(denom: string, amount: BigNumber) {
    if (amount.isZero()) {
      return setDeposits((deposits) => {
        deposits.delete(denom)
        return new Map(deposits)
      })
    }

    setDeposits((deposits) => {
      deposits.set(denom, amount)
      props.onChangeDeposits(deposits)
      return new Map(deposits)
    })
  }

  function onChangeSlider(value: number) {
    setPercentage(value)
    setDeposits((deposits) => {
      deposits.set(props.primaryAsset.denom, primaryMax.multipliedBy(value / 100))
      deposits.set(props.secondaryAsset.denom, secondaryMax.multipliedBy(value / 100))
      return new Map(deposits)
    })
  }

  return (
    <div className='flex h-full flex-col justify-between gap-6 p-4'>
      <TokenInput
        onChange={onChangePrimaryDeposit}
        amount={deposits.get(props.primaryAsset.denom) ?? BN(0)}
        max={primaryMax}
        maxText='Balance'
        asset={props.primaryAsset}
      />
      {!isCustomAmount && <Slider value={percentage} onChange={onChangeSlider} />}
      <TokenInput
        onChange={onChangeSecondaryDeposit}
        amount={deposits.get(props.secondaryAsset.denom) ?? BN(0)}
        max={secondaryMax}
        maxText='Balance'
        asset={props.secondaryAsset}
      />
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
  )
}
