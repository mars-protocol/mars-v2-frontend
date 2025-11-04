import React, { useEffect, useMemo, useState } from 'react'

import Button from 'components/common/Button'
import { Callout, CalloutType } from 'components/common/Callout'
import DepositCapMessage from 'components/common/DepositCapMessage'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Divider from 'components/common/Divider'
import { ArrowRight, ExclamationMarkCircled } from 'components/common/Icons'
import Index from 'components/common/Slider'
import Text from 'components/common/Text'
import TokenInput from 'components/common/TokenInput'
import { BN_ZERO } from 'constants/math'
import { ORACLE_DENOM } from 'constants/oracle'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useMarkets from 'hooks/markets/useMarkets'
import useSlippage from 'hooks/settings/useSlippage'
import useAutoLend from 'hooks/wallet/useAutoLend'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { removeEmptyBNCoins } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { findCoinByDenom } from 'utils/assets'
import { HF_THRESHOLD } from 'utils/constants'
import { getFarmActions } from 'utils/farm'
import { formatPercent } from 'utils/formatters'
import { mergeBNCoinArrays } from 'utils/helpers'

export default function FarmBorrowings(props: FarmBorrowingsProps) {
  const assets = useDepositEnabledAssets()
  const { borrowings, onChangeBorrowings, type } = props
  const isAstroLp = type === 'astroLp'
  const farm = isAstroLp ? (props.farm as AstroLp) : (props.farm as Vault)
  const markets = useMarkets()
  const modal = useStore((s) => s.farmModal)
  const depositIntoFarm = useStore((s) => s.depositIntoFarm)
  const updatedAccount = useStore((s) => s.updatedAccount)
  const { computeMaxBorrowAmount } = useHealthComputer(props.account)
  const [percentage, setPercentage] = useState<number>(0)
  const [slippage] = useSlippage()
  const chainConfig = useChainConfig()
  const { isAutoLendEnabledForCurrentAccount: isAutoLend } = useAutoLend()
  const [isCalculating, setIsCaluclating] = useState(false)
  const { healthFactor: updatedHealthFactor } = useHealthComputer(updatedAccount)

  const calculateSliderPercentage = (maxBorrowAmounts: BNCoin[], borrowings: BNCoin[]) => {
    if (borrowings.length === 1) {
      const amount = borrowings[0].amount
      if (amount.isZero()) return 0
      const max = maxBorrowAmounts.find(byDenom(borrowings[0].denom))?.amount || BN_ZERO
      return amount.times(100).dividedBy(max).toNumber()
    }
    return 0
  }

  const maxBorrowAmountsRaw: BNCoin[] = useMemo(() => {
    return props.borrowings.map((borrowing) => {
      const maxAmount = computeMaxBorrowAmount(
        borrowing.denom,
        isAstroLp
          ? { swap: { denom_out: farm.denoms.lp, slippage: slippage.toString() } }
          : {
              vault: { address: farm.address },
            },
      )
      return new BNCoin({
        denom: borrowing.denom,
        amount: maxAmount.toString(),
      })
    })
  }, [props.borrowings, computeMaxBorrowAmount, isAstroLp, farm.address, farm.denoms.lp, slippage])

  const maxBorrowAmounts = useMemo(() => {
    const borrowPowerLeft = props.borrowings.reduce((capLeft, borrowing) => {
      const maxAmount = maxBorrowAmountsRaw.find((amount) => amount.denom === borrowing.denom)

      if (!maxAmount || maxAmount.amount.isZero()) return capLeft
      capLeft -= borrowing.amount.dividedBy(maxAmount.amount).toNumber()
      return capLeft
    }, 1)

    return maxBorrowAmountsRaw.map((maxAmount) => {
      return new BNCoin({
        denom: maxAmount.denom,
        amount: maxAmount.amount.times(borrowPowerLeft).integerValue().toString(),
      })
    })
  }, [maxBorrowAmountsRaw, props.borrowings])

  useEffect(() => {
    const selectedBorrowDenoms = modal?.selectedBorrowDenoms || []
    if (
      borrowings.length === selectedBorrowDenoms.length &&
      borrowings.every((coin) => selectedBorrowDenoms.includes(coin.denom))
    ) {
      return
    }
    const updatedBorrowings = selectedBorrowDenoms.map((denom) => {
      const amount = findCoinByDenom(denom, borrowings)?.amount || BN_ZERO

      return new BNCoin({
        denom,
        amount: amount.toString(),
      })
    })
    setPercentage(calculateSliderPercentage(maxBorrowAmounts, updatedBorrowings))
    onChangeBorrowings(updatedBorrowings)
  }, [modal, maxBorrowAmounts, borrowings, onChangeBorrowings])

  function onChangeSlider(value: number) {
    if (props.borrowings.length !== 1) return

    const denom = props.borrowings[0].denom
    const currentAmount = props.borrowings[0].amount
    const maxAmount = maxBorrowAmounts.find(byDenom(denom))?.amount ?? BN_ZERO
    const newBorrowings: BNCoin[] = [
      new BNCoin({
        denom,
        amount: (
          maxAmount.plus(currentAmount).multipliedBy(value).dividedBy(100).decimalPlaces(0) ||
          BN_ZERO
        ).toString(),
      }),
    ]

    props.onChangeBorrowings(newBorrowings)
    setPercentage(value)
  }

  function updateAssets(denom: string, amount: BigNumber) {
    const index = props.borrowings.findIndex((coin) => coin.denom === denom)
    const newBorrowings = [...props.borrowings]
    newBorrowings[index].amount = amount
    props.onChangeBorrowings(newBorrowings)
  }

  function onDelete(denom: string) {
    const index = props.borrowings.findIndex((coin) => coin.denom === denom)
    props.borrowings.splice(index, 1)
    const newBorrowings = [...props.borrowings]
    props.onChangeBorrowings(newBorrowings)
    if (!modal) return

    useStore.setState({
      farmModal: {
        ...modal,
        selectedBorrowDenoms: props.borrowings.map((coin) => coin.denom),
      },
    })
    setPercentage(calculateSliderPercentage(maxBorrowAmounts, newBorrowings))
  }

  function addAsset() {
    useStore.setState({
      addFarmBorrowingsModal: {
        selectedDenoms: props.borrowings.map((coin) => coin.denom),
      },
    })
    setPercentage(calculateSliderPercentage(maxBorrowAmounts, props.borrowings))
  }

  async function onConfirm() {
    if (!updatedAccount || !modal) return
    setIsCaluclating(true)
    const actions = await getFarmActions(
      farm,
      props.deposits,
      props.reclaims,
      props.borrowings,
      assets,
      slippage,
      chainConfig,
      isAutoLend,
      isAstroLp,
      false,
    )

    useStore.setState({ farmModal: null })
    setIsCaluclating(false)
    await depositIntoFarm({
      accountId: updatedAccount.id,
      actions,
      deposits: isAstroLp
        ? mergeBNCoinArrays(props.deposits, props.reclaims)
        : removeEmptyBNCoins(props.deposits),
      borrowings: props.borrowings,
      kind: 'default' as AccountKind,
    })
  }

  return (
    <div className='flex flex-col flex-1 gap-4 p-4'>
      {props.borrowings.map((coin) => {
        const asset = assets.find(byDenom(coin.denom))
        const maxAmount = maxBorrowAmounts.find(byDenom(coin.denom))?.amount ?? BN_ZERO

        if (!asset || !maxAmount)
          return <React.Fragment key={`input-${coin.denom}`}></React.Fragment>
        return (
          <TokenInput
            key={`input-${coin.denom}`}
            amount={coin.amount}
            asset={asset}
            max={maxAmount.plus(coin.amount)}
            maxText='Max Borrow'
            onChange={(amount) => updateAssets(coin.denom, amount)}
            onDelete={() => onDelete(coin.denom)}
            warningMessages={[]}
          />
        )
      })}
      {props.borrowings.length === 1 && <Index onChange={onChangeSlider} value={percentage} />}
      {props.borrowings.length === 0 && (
        <div className='flex items-center gap-4 py-2'>
          <div className='w-6 h-6'>
            <ExclamationMarkCircled />
          </div>
          <Text size='xs'>
            You have no borrowing assets selected. Click on select borrow assets if you would like
            to add assets to borrow.
          </Text>
        </div>
      )}

      <Button text='Select borrow assets +' color='tertiary' onClick={addAsset} />

      <DepositCapMessage
        action='deposit'
        coins={props.depositCapReachedCoins}
        className='px-4 y-2'
        showIcon
      />

      <Divider />
      <div className='flex flex-col gap-2'>
        <div className='flex justify-between'>
          <Text className='text-white/50'>{`${props.primaryAsset.symbol}-${props.secondaryAsset.symbol} Position Value`}</Text>
          <DisplayCurrency
            coin={new BNCoin({ denom: ORACLE_DENOM, amount: props.totalValue.toString() })}
            options={{ abbreviated: false, minDecimals: 2, maxDecimals: 2 }}
          />
        </div>
        {props.borrowings.map((coin) => {
          const asset = assets.find(byDenom(coin.denom))
          const borrowRate = markets?.find((market) => market.asset.denom === coin.denom)?.apy
            .borrow

          if (!asset || !borrowRate)
            return <React.Fragment key={`borrow-rate-${coin.denom}`}></React.Fragment>
          return (
            <div key={`borrow-rate-${coin.denom}`} className='flex justify-between'>
              <Text className='text-white/50'>Borrow APR {asset.symbol}</Text>
              <Text>{formatPercent(borrowRate)}</Text>
            </div>
          )
        })}
      </div>
      {updatedHealthFactor <= HF_THRESHOLD && (
        <Callout type={CalloutType.WARNING}>
          You can not provide this much liquidity as your Accounts Health Factor would end up too
          close to 1.
        </Callout>
      )}
      <Button
        onClick={onConfirm}
        color='primary'
        text='Deposit'
        rightIcon={<ArrowRight />}
        showProgressIndicator={isCalculating}
        disabled={updatedHealthFactor <= HF_THRESHOLD || props.depositCapReachedCoins.length > 0}
      />
    </div>
  )
}
