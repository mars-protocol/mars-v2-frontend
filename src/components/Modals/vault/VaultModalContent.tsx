import BigNumber from 'bignumber.js'
import { useState } from 'react'

import Accordion from 'components/Accordion'
import AccountSummary from 'components/Account/AccountSummary'
import { Button } from 'components/Button'
import Divider from 'components/Divider'
import { FormattedNumber } from 'components/FormattedNumber'
import { ArrowRight } from 'components/Icons'
import Slider from 'components/Slider'
import Switch from 'components/Switch'
import TokenInput from 'components/TokenInput'
import useIsOpenArray from 'hooks/useIsOpenArray'
import usePrice from 'hooks/usePrice'
import { getAmount } from 'utils/accounts'
import { BN } from 'utils/helpers'
import Text from 'components/Text'

interface Props {
  vault: Vault
  primaryAsset: Asset
  secondaryAsset: Asset
  currentAccount: Account
}

export default function VaultModalContent(props: Props) {
  const [isCustomAmount, setIsCustomAmount] = useState(false)
  const [percentage, setPercentage] = useState(0)
  const [isOpen, toggleOpen] = useIsOpenArray(2, false)
  const [position, setPosition] = useState<{
    deposit: Map<string, BigNumber>
    borrow: Map<string, BigNumber>
  }>({
    deposit: new Map(),
    borrow: new Map(),
  })

  const availablePrimaryAmount = getAmount(props.primaryAsset.denom, props.currentAccount.deposits)
  const availableSecondaryAmount = getAmount(
    props.secondaryAsset.denom,
    props.currentAccount.deposits,
  )

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
      position.deposit.clear()
      setPosition({ ...position })
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
    if (amount.isZero()) position.deposit.delete(denom)

    setPosition((prev) => {
      prev.deposit.set(denom, amount)
      return { ...prev }
    })
  }

  function onChangeSlider(value: number) {
    setPercentage(value)
    setPosition((prev) => {
      prev.deposit.set(props.primaryAsset.denom, primaryMax.multipliedBy(value / 100))
      prev.deposit.set(props.secondaryAsset.denom, secondaryMax.multipliedBy(value / 100))
      return prev
    })
  }

  function onChangeBorrow(denom: string, value: BigNumber) {
    if (value.isZero()) position.deposit.delete(denom)

    setPosition((prev) => {
      prev.borrow.set(denom, value)
      return { ...prev }
    })
  }

  return (
    <div className='flex flex-grow items-start gap-6 p-6'>
      <Accordion
        items={[
          {
            content: (
              <div className='flex h-full flex-col justify-between gap-6 p-4'>
                <TokenInput
                  onChange={onChangePrimaryDeposit}
                  amount={position.deposit.get(props.primaryAsset.denom) ?? BN(0)}
                  max={primaryMax}
                  maxText='Balance'
                  asset={props.primaryAsset}
                  disabled={primaryMax.isZero()}
                />
                {!isCustomAmount && (
                  <Slider
                    value={percentage}
                    onChange={onChangeSlider}
                    disabled={primaryMax.isZero() || secondaryMax.isZero()}
                  />
                )}
                <TokenInput
                  onChange={onChangeSecondaryDeposit}
                  amount={position.deposit.get(props.secondaryAsset.denom) ?? BN(0)}
                  max={secondaryMax}
                  maxText='Balance'
                  asset={props.secondaryAsset}
                  disabled={secondaryMax.isZero()}
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
                  onClick={() => toggleOpen(1)}
                  className='w-full'
                  text='Continue'
                  rightIcon={<ArrowRight />}
                />
              </div>
            ),
            title: 'Deposit',
            isOpen: isOpen[0],
            toggleOpen: (index: number) => toggleOpen(index),
          },
          {
            content: (
              <div className='flex h-full flex-col justify-between gap-6 p-4'>
                <TokenInput
                  onChange={(value: BigNumber) => onChangeBorrow(props.primaryAsset.denom, value)}
                  amount={position.borrow.get(props.primaryAsset.denom) ?? BN(0)}
                  max={primaryMax}
                  maxText='Available to borrow'
                  asset={props.primaryAsset}
                />
                <div className='flex justify-between'>
                  <Text className='text-white/50'>Custom amount</Text>
                  <Switch checked={isCustomAmount} onChange={handleSwitch} name='customAmount' />
                </div>
                <div className='flex justify-between'>
                  <Text className='text-white/50'>{`${props.primaryAsset.symbol}-${props.secondaryAsset.symbol} Position Value`}</Text>
                  <FormattedNumber amount={0} options={{ prefix: '$' }} />
                </div>
                <Button
                  onClick={() => {}}
                  className='w-full'
                  text='Continue'
                  rightIcon={<ArrowRight />}
                />
              </div>
            ),
            title: 'Borrow',
            isOpen: isOpen[1],
            toggleOpen: (index: number) => toggleOpen(index),
          },
        ]}
      />

      <AccountSummary account={props.currentAccount} />
    </div>
  )
}
