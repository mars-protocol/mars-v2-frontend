import { useCallback, useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import Button from 'components/common/Button'
import { ArrowRight } from 'components/common/Icons'
import Text from 'components/common/Text'
import Switch from 'components/common/Switch'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { getCoinValue, demagnify } from 'utils/formatters'
import { byDenom } from 'utils/array'
import { LeverageSection } from 'components/perps/Module/LeverageSection'
import { Callout, CalloutType } from 'components/common/Callout'
import AssetAmountInput from 'components/common/AssetAmountInput'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import { getAccountNetValue } from 'utils/accounts'

interface Props {
  isHedgeEnabled: boolean
  setIsHedgeEnabled: (enabled: boolean) => void
  primaryAsset: Asset
  secondaryAsset: Asset
  depositCoins: BNCoin[]
  borrowCoins: BNCoin[]
  onChangeBorrowings: (coins: BNCoin[]) => void
  assets: Asset[]
  toggleOpen: (index: number) => void
  account: Account
}

export default function FarmHedge(props: Props) {
  const {
    isHedgeEnabled,
    setIsHedgeEnabled,
    primaryAsset,
    secondaryAsset,
    depositCoins,
    borrowCoins,
    onChangeBorrowings,
    assets,
    toggleOpen,
    account,
  } = props

  const [isMaxSelected, setIsMaxSelected] = useState(false)
  const { computeMaxBorrowAmount } = useHealthComputer(account)

  // Calculate the amount of volatile asset (secondary) in the LP position
  const secondaryAssetInLp = useMemo(() => {
    const secondaryDeposit = depositCoins.find((coin) => coin.denom === secondaryAsset.denom)
    if (!secondaryDeposit) return BN_ZERO
    return secondaryDeposit.amount
  }, [depositCoins, secondaryAsset.denom])

  // Calculate account net value for leverage calculations
  const accountNetValue = useMemo(() => {
    if (!account) return BN_ZERO
    return getAccountNetValue(account, assets)
  }, [account, assets])

  // Calculate maximum hedge amount based on health factor
  const maxHedgeAmount = useMemo(() => {
    const baseMaxAmount = computeMaxBorrowAmount(secondaryAsset.denom, {
      swap: {
        denom_out: secondaryAsset.denom,
        slippage: '0.01',
      },
    })
    return BigNumber.min(baseMaxAmount, secondaryAssetInLp)
  }, [computeMaxBorrowAmount, secondaryAsset.denom, secondaryAssetInLp])

  const currentHedgeAmount = useMemo(() => {
    const hedgeBorrow = borrowCoins.find((coin) => coin.denom === secondaryAsset.denom)
    return hedgeBorrow?.amount || BN_ZERO
  }, [borrowCoins, secondaryAsset.denom])

  // Calculate current leverage of the hedge position
  const leverage = useMemo(() => {
    if (currentHedgeAmount.isZero() || accountNetValue.isZero()) return 0
    return getCoinValue(
      BNCoin.fromDenomAndBigNumber(secondaryAsset.denom, currentHedgeAmount),
      assets,
    )
      .div(accountNetValue)
      .toNumber()
  }, [currentHedgeAmount, secondaryAsset.denom, accountNetValue, assets])

  // Calculate maximum leverage based on max borrow amount
  const maxLeverage = useMemo(() => {
    const totalPositionValue =
      secondaryAsset.price?.amount.times(demagnify(maxHedgeAmount, secondaryAsset)) || BN_ZERO
    const maxLev = totalPositionValue.div(accountNetValue).toNumber()
    if (maxLev === Infinity) return 0
    if (maxLev < 1 && maxLev > 0) return maxLev
    return Math.max(maxLev, 1)
  }, [maxHedgeAmount, secondaryAsset, accountNetValue])

  const onChangeHedgeAmount = useCallback(
    (amount: BigNumber) => {
      const updatedBorrowings = [...borrowCoins]
      const hedgeIndex = updatedBorrowings.findIndex((coin) => coin.denom === secondaryAsset.denom)

      if (hedgeIndex >= 0) {
        updatedBorrowings[hedgeIndex] = BNCoin.fromDenomAndBigNumber(secondaryAsset.denom, amount)
      } else {
        updatedBorrowings.push(BNCoin.fromDenomAndBigNumber(secondaryAsset.denom, amount))
      }

      onChangeBorrowings(updatedBorrowings)
    },
    [borrowCoins, onChangeBorrowings, secondaryAsset.denom],
  )

  const onChangeLeverage = useCallback(
    (newLeverage: number) => {
      if (maxHedgeAmount.isZero() || accountNetValue.isZero()) return
      const price = secondaryAsset.price?.amount ?? BN_ZERO
      if (price.isZero()) return

      const newAmount = accountNetValue
        .times(newLeverage)
        .dividedBy(price)
        .shiftedBy(secondaryAsset.decimals)
      const finalAmount = BigNumber.min(newAmount, maxHedgeAmount).integerValue()

      onChangeHedgeAmount(finalAmount)
    },
    [maxHedgeAmount, accountNetValue, secondaryAsset, onChangeHedgeAmount],
  )

  const toggleHedge = useCallback(
    (enabled: boolean) => {
      setIsHedgeEnabled(enabled)
      if (!enabled) {
        // Remove the hedge borrowing when disabled
        const updatedBorrowings = borrowCoins.filter((coin) => coin.denom !== secondaryAsset.denom)
        onChangeBorrowings(updatedBorrowings)
      } else {
        // Set default hedge to 100% when enabled
        onChangeHedgeAmount(maxHedgeAmount)
      }
    },
    [borrowCoins, maxHedgeAmount, onChangeBorrowings, secondaryAsset.denom, setIsHedgeEnabled],
  )

  const warningMessages = useMemo(() => {
    const messages: string[] = []

    if (currentHedgeAmount.isGreaterThan(maxHedgeAmount)) {
      messages.push('The entered amount exceeds the maximum allowed hedge amount.')
    }

    if (currentHedgeAmount.isGreaterThan(secondaryAssetInLp)) {
      messages.push(
        `Cannot hedge more than the ${secondaryAsset.symbol} amount in the LP position.`,
      )
    }

    return messages
  }, [currentHedgeAmount, maxHedgeAmount, secondaryAssetInLp, secondaryAsset.symbol])

  return (
    <div className='flex flex-col gap-4 p-4'>
      <div className='flex items-center justify-between'>
        <div>
          <Text>Hedge Position</Text>
          <Text size='xs' className='text-white/60'>
            Short {secondaryAsset.symbol} to reduce volatility exposure
          </Text>
        </div>
        <Switch name='hedge-position-toggle' checked={isHedgeEnabled} onChange={toggleHedge} />
      </div>

      {isHedgeEnabled && (
        <>
          <TokenInputWithSlider
            amount={currentHedgeAmount}
            asset={secondaryAsset}
            max={maxHedgeAmount}
            onChange={onChangeHedgeAmount}
            maxText={`Max ${secondaryAsset.symbol} to Hedge`}
            warningMessages={warningMessages}
          />

          {!maxHedgeAmount.isZero() && (
            <LeverageSection
              maxLeverage={maxLeverage}
              effectiveLeverage={leverage}
              onChangeLeverage={onChangeLeverage}
              tradeDirection='short'
              isDisabledAmountInput={false}
              maxAmount={maxHedgeAmount}
            />
          )}

          {warningMessages.map((message) => (
            <Callout key={message} type={CalloutType.WARNING}>
              {message}
            </Callout>
          ))}

          <Text size='xs' className='text-white/60'>
            This will borrow and short {secondaryAsset.symbol} to offset your LP exposure
          </Text>
          <Button onClick={() => toggleOpen(2)} text='Continue' rightIcon={<ArrowRight />} />
        </>
      )}
    </div>
  )
}
