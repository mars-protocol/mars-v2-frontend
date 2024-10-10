import { useCallback, useMemo, useState } from 'react'

import Button from 'components/common/Button'
import { Callout, CalloutType } from 'components/common/Callout'
import DepositCapMessage from 'components/common/DepositCapMessage'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Divider from 'components/common/Divider'
import { Gauge } from 'components/common/Gauge'
import { ArrowRight, ExclamationMarkCircled } from 'components/common/Icons'
import Slider from 'components/common/Slider'
import Switch from 'components/common/Switch'
import Text from 'components/common/Text'
import TokenInput from 'components/common/TokenInput'
import { BN_ZERO } from 'constants/math'
import { ORACLE_DENOM } from 'constants/oracle'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { accumulateAmounts } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { HF_THRESHOLD } from 'utils/constants'
import { BN, getValueFromBNCoins } from 'utils/helpers'

interface Props {
  deposits: BNCoin[]
  primaryAsset: Asset
  secondaryAsset: Asset
  account: Account
  isCustomRatio: boolean
  onChangeDeposits: (deposits: BNCoin[]) => void
  onChangeIsCustomRatio: (isCustomRatio: boolean) => void
  toggleOpen: (index: number) => void
  depositCapReachedCoins: BNCoin[]
  type: FarmModal['type']
}

export default function FarmDeposits(props: Props) {
  const { deposits, primaryAsset, secondaryAsset, account, onChangeDeposits, type } = props
  const address = useStore((s) => s.address)
  const { data: walletBalances } = useWalletBalances(address)
  const [availablePrimaryAmount, availableSecondaryAmount] = useMemo(() => {
    if (type === 'high_leverage') {
      return [
        BN(walletBalances.find(byDenom(primaryAsset.denom))?.amount ?? 0),
        BN(walletBalances.find(byDenom(secondaryAsset.denom))?.amount ?? 0),
      ]
    } else {
      return [
        accumulateAmounts(primaryAsset.denom, [...account.deposits, ...account.lends]),
        accumulateAmounts(secondaryAsset.denom, [...account.deposits, ...account.lends]),
      ]
    }
  }, [
    account.deposits,
    account.lends,
    primaryAsset.denom,
    secondaryAsset.denom,
    type,
    walletBalances,
  ])

  const assets = useDepositEnabledAssets()
  const primaryPrice = useMemo(() => primaryAsset.price?.amount ?? BN_ZERO, [primaryAsset])
  const secondaryPrice = useMemo(() => secondaryAsset.price?.amount ?? BN_ZERO, [secondaryAsset])

  const primaryCoin = useMemo(() => {
    const amount = deposits.find(byDenom(primaryAsset.denom))?.amount ?? BN_ZERO
    return new BNCoin({ denom: primaryAsset.denom, amount: amount.toString() })
  }, [deposits, primaryAsset.denom])

  const secondaryCoin = useMemo(() => {
    const amount = deposits.find(byDenom(secondaryAsset.denom))?.amount ?? BN_ZERO
    return new BNCoin({ denom: secondaryAsset.denom, amount: amount.toString() })
  }, [deposits, secondaryAsset.denom])

  const primaryValue = useMemo(
    () => getValueFromBNCoins([primaryCoin], assets),
    [primaryCoin, assets],
  )

  const totalValue = useMemo(
    () => getValueFromBNCoins([primaryCoin, secondaryCoin], assets),
    [primaryCoin, secondaryCoin, assets],
  )

  const primaryValuePercentage = useMemo(() => {
    const value = primaryValue.dividedBy(totalValue).multipliedBy(100).decimalPlaces(2).toNumber()
    return isNaN(value) ? 50 : value
  }, [primaryValue, totalValue])

  const secondaryValuePercentage = useMemo(
    () => BN(100).minus(primaryValuePercentage).integerValue(2).toNumber() ?? 50,
    [primaryValuePercentage],
  )

  const maxAssetValueNonCustom = useMemo(
    () =>
      BN(
        Math.min(
          availablePrimaryAmount
            .shiftedBy(-primaryAsset.decimals)
            .multipliedBy(primaryPrice)
            .toNumber(),
          availableSecondaryAmount
            .shiftedBy(-secondaryAsset.decimals)
            .multipliedBy(secondaryPrice)
            .toNumber(),
        ),
      ),
    [
      availablePrimaryAmount,
      availableSecondaryAmount,
      primaryAsset,
      primaryPrice,
      secondaryAsset,
      secondaryPrice,
    ],
  )
  const primaryMax = useMemo(
    () =>
      props.isCustomRatio
        ? availablePrimaryAmount
        : maxAssetValueNonCustom
            .dividedBy(primaryPrice)
            .shiftedBy(primaryAsset.decimals)
            .integerValue(),
    [
      props.isCustomRatio,
      availablePrimaryAmount,
      primaryPrice,
      primaryAsset,
      maxAssetValueNonCustom,
    ],
  )
  const secondaryMax = useMemo(() => {
    return props.isCustomRatio
      ? availableSecondaryAmount
      : maxAssetValueNonCustom
          .dividedBy(secondaryPrice)
          .shiftedBy(secondaryAsset.decimals)
          .integerValue()
  }, [
    props.isCustomRatio,
    availableSecondaryAmount,
    secondaryPrice,
    secondaryAsset,
    maxAssetValueNonCustom,
  ])

  const [percentage, setPercentage] = useState(
    primaryValue.dividedBy(maxAssetValueNonCustom).multipliedBy(100).decimalPlaces(0).toNumber() ||
      0,
  )
  const disableInput = useMemo(
    () =>
      (availablePrimaryAmount.isZero() || availableSecondaryAmount.isZero()) &&
      !props.isCustomRatio,
    [availablePrimaryAmount, availableSecondaryAmount, props.isCustomRatio],
  )

  function handleSwitch() {
    const isCustomRatioNew = !props.isCustomRatio
    if (!isCustomRatioNew) {
      primaryCoin.amount = BN_ZERO
      secondaryCoin.amount = BN_ZERO
      onChangeDeposits([primaryCoin, secondaryCoin])
      setPercentage(0)
    }
    props.onChangeIsCustomRatio(isCustomRatioNew)
  }

  const onChangePrimaryDeposit = useCallback(
    (amount: BigNumber) => {
      if (amount.isGreaterThan(primaryMax)) {
        amount = primaryMax
      }
      primaryCoin.amount = amount
      setPercentage(amount.dividedBy(primaryMax).multipliedBy(100).decimalPlaces(0).toNumber())
      if (!props.isCustomRatio) {
        secondaryCoin.amount = secondaryMax
          .multipliedBy(amount.dividedBy(primaryMax))
          .integerValue()
      }

      onChangeDeposits([primaryCoin, secondaryCoin])
    },
    [primaryMax, secondaryMax, props.isCustomRatio, primaryCoin, secondaryCoin, onChangeDeposits],
  )

  const onChangeSecondaryDeposit = useCallback(
    (amount: BigNumber) => {
      if (amount.isGreaterThan(secondaryMax)) {
        amount = secondaryMax
      }
      secondaryCoin.amount = amount
      setPercentage(amount.dividedBy(secondaryMax).multipliedBy(100).decimalPlaces(0).toNumber())
      if (!props.isCustomRatio) {
        primaryCoin.amount = primaryMax.multipliedBy(amount.dividedBy(secondaryMax)).integerValue()
      }

      onChangeDeposits([primaryCoin, secondaryCoin])
    },
    [primaryMax, secondaryMax, props.isCustomRatio, primaryCoin, secondaryCoin, onChangeDeposits],
  )

  const onChangeSlider = useCallback(
    (value: number) => {
      if (percentage !== value) setPercentage(value)
      primaryCoin.amount = primaryMax.multipliedBy(value / 100).integerValue()
      secondaryCoin.amount = secondaryMax.multipliedBy(value / 100).integerValue()
      onChangeDeposits([primaryCoin, secondaryCoin])
    },
    [percentage, primaryCoin, primaryMax, secondaryCoin, secondaryMax, onChangeDeposits],
  )

  const getWarningText = useCallback((asset: Asset) => {
    return `You don't have ${asset.symbol} balance in your account. Toggle custom amount to deposit.`
  }, [])
  const updatedAccount = useStore((s) => s.updatedAccount)
  const { healthFactor: updatedHealthFactor } = useHealthComputer(updatedAccount)

  return (
    <div className='flex flex-col'>
      <div className='flex gap-4 p-4 pl-3'>
        <div className='flex flex-col items-center justify-between gap-1 pb-[30px] pt-2'>
          <Gauge
            percentage={primaryValuePercentage}
            tooltip={`${primaryValuePercentage}% of value is ${primaryAsset.symbol}`}
            diameter={32}
            strokeClass='hsl(2, 100%, 69%)'
            strokeWidth={3}
          />
          <div className='h-full w-[1px] rounded-xl bg-white/10'></div>
          <Gauge
            percentage={secondaryValuePercentage}
            tooltip={`${secondaryValuePercentage}% of value is ${secondaryAsset.symbol}`}
            diameter={32}
            strokeClass='hsl(2, 100%, 69%)'
            strokeWidth={3}
          />
        </div>
        <div className='flex flex-col justify-between flex-1 h-full gap-6'>
          <TokenInput
            onChange={onChangePrimaryDeposit}
            amount={primaryCoin.amount}
            max={availablePrimaryAmount}
            maxText='Balance'
            asset={primaryAsset}
            warningMessages={availablePrimaryAmount.isZero() ? [getWarningText(primaryAsset)] : []}
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
            disabled={disableInput}
            warningMessages={
              availableSecondaryAmount.isZero() ? [getWarningText(secondaryAsset)] : []
            }
          />
        </div>
      </div>

      <DepositCapMessage
        action='deposit'
        coins={props.depositCapReachedCoins}
        className='px-4 "y-2'
        showIcon
      />

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
            coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, totalValue)}
            options={{ abbreviated: false, minDecimals: 2, maxDecimals: 2 }}
          />
        </div>
        {updatedHealthFactor <= HF_THRESHOLD && (
          <Callout type={CalloutType.WARNING}>
            You can not provide this much liquidity as your Accounts Health Factor would drop below
            1.
          </Callout>
        )}
        <Button
          onClick={() => props.toggleOpen(1)}
          disabled={updatedHealthFactor <= HF_THRESHOLD}
          className='w-full'
          text='Continue'
          rightIcon={<ArrowRight />}
        />
      </div>
    </div>
  )
}
