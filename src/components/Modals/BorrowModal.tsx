import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { getButtonText, RepayAssets } from 'components/Modals/BorrowModal/RepayAssets'
import Modal from 'components/Modals/Modal'
import AccountSummaryInModal from 'components/account/AccountSummary/AccountSummaryInModal'
import Button from 'components/common/Button'
import Card from 'components/common/Card'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Divider from 'components/common/Divider'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { ArrowRight } from 'components/common/Icons'
import SwapDetails from 'components/common/SwapDetails/SwapDetails'
import Switch from 'components/common/Switch'
import Text from 'components/common/Text'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import AssetImage from 'components/common/assets/AssetImage'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useToggle from 'hooks/common/useToggle'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useMarkets from 'hooks/markets/useMarkets'
import useSlippage from 'hooks/settings/useSlippage'
import useSwapRoute, { combinedRepay } from 'hooks/swap/useSwapRoute'
import useAutoLend from 'hooks/wallet/useAutoLend'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { formatPercent } from 'utils/formatters'
import { BN } from 'utils/helpers'
import { getDebtAmountWithInterest } from 'utils/tokens'

interface Props {
  account: Account
  modal: BorrowModal
}

export default function BorrowModalController() {
  const account = useCurrentAccount()
  const modal = useStore((s) => s.borrowModal)

  if (account && modal) {
    return <BorrowModal account={account} modal={modal} />
  }

  return null
}

function BorrowModal(props: Props) {
  const { modal, account } = props
  const [amounts, setAmounts] = useState({
    main: BN_ZERO,
    debtAsset: BN_ZERO,
    swapAsset: BN_ZERO,
  })
  const [maxValues, setMaxValues] = useState({
    main: BN_ZERO,
    debtAsset: BN_ZERO,
    swapAsset: BN_ZERO,
  })
  const [borrowToWallet, setBorrowToWallet] = useToggle()
  const [repayFromWallet, setRepayFromWallet] = useToggle()
  const [loadingState, setLoadingState] = useState<{
    isLoading: boolean
    action: 'none' | 'borrow' | 'repay' | 'simulation'
  }>({
    isLoading: false,
    action: 'none',
  })
  const [useDebtAsset, setUseDebtAsset] = useState(false)
  const [selectedSwapAsset, setSelectedSwapAsset] = useState<Asset | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [hasUserMadeSelection, setHasUserMadeSelection] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

  const { main: amount, debtAsset: debtAssetAmount, swapAsset: swapAssetAmount } = amounts
  const { main: max, debtAsset: debtAssetMax, swapAsset: swapAssetMax } = maxValues

  const walletAddress = useStore((s) => s.address)
  const { data: walletBalances } = useWalletBalances(walletAddress)
  const borrow = useStore((s) => s.borrow)
  const assets = useStore((s) => s.assets)
  const asset = modal.asset
  const isRepay = modal.isRepay ?? false
  const { simulateBorrow, simulateCombinedRepay } = useUpdatedAccount(account)
  const apy = modal.marketData.apy.borrow
  const { isAutoLendEnabledForCurrentAccount: isAutoLendEnabled } = useAutoLend()
  const { computeMaxBorrowAmount } = useHealthComputer(account)
  const accountDebt = account.debts.find(byDenom(asset.denom))?.amount ?? BN_ZERO
  const markets = useMarkets()
  const [slippage] = useSlippage()

  const setAmount = (value: BigNumber) => setAmounts((prev) => ({ ...prev, main: value }))
  const setDebtAssetAmount = (value: BigNumber) =>
    setAmounts((prev) => ({ ...prev, debtAsset: value }))
  const setSwapAssetAmount = (value: BigNumber) =>
    setAmounts((prev) => ({ ...prev, swapAsset: value }))

  const setMax = (value: BigNumber) => setMaxValues((prev) => ({ ...prev, main: value }))
  const setDebtAssetMax = (value: BigNumber) =>
    setMaxValues((prev) => ({ ...prev, debtAsset: value }))
  const setSwapAssetMax = (value: BigNumber) =>
    setMaxValues((prev) => ({ ...prev, swapAsset: value }))

  const accountDebtWithInterest = useMemo(
    () => getDebtAmountWithInterest(accountDebt, apy),
    [accountDebt, apy],
  )

  const overpayExeedsCap = useMemo(() => {
    const marketAsset = markets.find((market) => market.asset.denom === asset.denom)
    if (!marketAsset || !marketAsset.cap) return
    const overpayAmount = accountDebtWithInterest.minus(accountDebt)
    const marketCapAfterOverpay = marketAsset.cap.used.plus(overpayAmount)

    return marketAsset.cap.max.isLessThanOrEqualTo(marketCapAfterOverpay)
  }, [markets, asset.denom, accountDebt, accountDebtWithInterest])

  const isDifferentAsset = useMemo(
    () => selectedSwapAsset?.denom !== asset.denom,
    [selectedSwapAsset?.denom, asset.denom],
  )

  const { maxDebtAssetAmount, maxSwapAssetAmount, totalRepayable } = useMemo(() => {
    if (!isRepay)
      return { maxDebtAssetAmount: BN_ZERO, maxSwapAssetAmount: BN_ZERO, totalRepayable: BN_ZERO }

    const maxDebtBalance = repayFromWallet
      ? BN(walletBalances.find(byDenom(asset.denom))?.amount ?? 0)
      : (account.deposits.find(byDenom(asset.denom))?.amount ?? BN_ZERO).plus(
          account.lends.find(byDenom(asset.denom))?.amount ?? BN_ZERO,
        )

    const borrowedAmount = overpayExeedsCap ? accountDebt : accountDebtWithInterest
    const maxDebtAmount = BigNumber.min(maxDebtBalance, borrowedAmount)

    let maxSwapBalance = BN_ZERO
    let equivalentSwapAmount = BN_ZERO

    if (selectedSwapAsset) {
      maxSwapBalance = repayFromWallet
        ? BN(walletBalances.find(byDenom(selectedSwapAsset.denom))?.amount ?? 0)
        : (account.deposits.find(byDenom(selectedSwapAsset.denom))?.amount ?? BN_ZERO).plus(
            account.lends.find(byDenom(selectedSwapAsset.denom))?.amount ?? BN_ZERO,
          )

      if (isDifferentAsset) {
        const debtAsset = markets.find((m) => m.asset.denom === asset.denom)
        const selectedAssetMarket = markets.find((m) => m.asset.denom === selectedSwapAsset.denom)

        if (debtAsset && selectedAssetMarket) {
          const debtAssetPrice = debtAsset.asset.price?.amount
          const selectedAssetPrice = selectedAssetMarket.asset.price?.amount

          if (debtAssetPrice && selectedAssetPrice) {
            const remainingDebtAmount = borrowedAmount.minus(useDebtAsset ? maxDebtAmount : BN_ZERO)

            if (remainingDebtAmount.lte(0)) {
              equivalentSwapAmount = BN_ZERO
            } else {
              const remainingDebtUSD = remainingDebtAmount
                .multipliedBy(debtAssetPrice)
                .shiftedBy(-debtAsset.asset.decimals)

              equivalentSwapAmount = BigNumber.min(
                maxSwapBalance,
                remainingDebtUSD
                  .dividedBy(selectedAssetPrice)
                  .shiftedBy(selectedSwapAsset.decimals)
                  .times(1.02)
                  .integerValue(),
              )
            }
          }
        }
      }
    }

    return {
      maxDebtAssetAmount: maxDebtAmount,
      maxSwapAssetAmount: equivalentSwapAmount,
      totalRepayable: borrowedAmount,
    }
  }, [
    isRepay,
    repayFromWallet,
    walletBalances,
    asset,
    selectedSwapAsset,
    account.deposits,
    account.lends,
    isDifferentAsset,
    overpayExeedsCap,
    accountDebt,
    accountDebtWithInterest,
    markets,
    useDebtAsset,
  ])

  const swapAdjustedDebtAssetMax = useMemo(() => {
    if (!isRepay || !selectedSwapAsset || !isDifferentAsset) return maxDebtAssetAmount

    const debtAsset = markets.find((m) => m.asset.denom === asset.denom)
    const selectedAssetMarket = markets.find((m) => m.asset.denom === selectedSwapAsset.denom)

    if (debtAsset?.asset.price && selectedAssetMarket?.asset.price) {
      const debtAssetPrice = debtAsset.asset.price.amount
      const selectedAssetPrice = selectedAssetMarket.asset.price.amount

      const swapAssetValue = swapAssetAmount
        .multipliedBy(selectedAssetPrice)
        .shiftedBy(-selectedSwapAsset.decimals)

      const swapAssetDebtReduction = swapAssetValue
        .times(0.98) // 2% buffer for fees
        .dividedBy(debtAssetPrice)
        .shiftedBy(debtAsset.asset.decimals)
        .integerValue()

      const remainingDebtAfterSwapAsset = BigNumber.max(
        totalRepayable.minus(swapAssetDebtReduction),
        BN_ZERO,
      )

      return BigNumber.min(maxDebtAssetAmount, remainingDebtAfterSwapAsset)
    }

    return maxDebtAssetAmount
  }, [
    isRepay,
    selectedSwapAsset,
    isDifferentAsset,
    maxDebtAssetAmount,
    markets,
    asset.denom,
    swapAssetAmount,
    totalRepayable,
  ])

  const hasDebtAsset = useMemo(() => {
    if (!isRepay) return false

    return maxDebtAssetAmount.isGreaterThan(0)
  }, [isRepay, maxDebtAssetAmount])

  useEffect(() => {
    if (isRepay) {
      setDebtAssetMax(swapAdjustedDebtAssetMax)
      setSwapAssetMax(maxSwapAssetAmount)
    }
  }, [isRepay, swapAdjustedDebtAssetMax, maxSwapAssetAmount])

  function resetState() {
    setAmount(BN_ZERO)
    setDebtAssetAmount(BN_ZERO)
    setSwapAssetAmount(BN_ZERO)
    setLoadingState({ isLoading: false, action: 'none' })
  }

  const remainingDebt = useMemo(() => {
    if (!isRepay) return BN_ZERO
    return BigNumber.max(totalRepayable.minus(debtAssetAmount), BN_ZERO)
  }, [isRepay, totalRepayable, debtAssetAmount])

  const adjustedSwapAssetMax = useMemo(() => {
    if (!isRepay || !isDifferentAsset || !selectedSwapAsset) return BN_ZERO

    const remainingDebtAfterDebtAsset = useDebtAsset ? remainingDebt : totalRepayable

    if (remainingDebtAfterDebtAsset.isZero()) return BN_ZERO

    const debtAssetMarket = markets.find((m) => m.asset.denom === asset.denom)
    const swapAssetMarket = markets.find((m) => m.asset.denom === selectedSwapAsset.denom)

    if (debtAssetMarket?.asset.price && swapAssetMarket?.asset.price) {
      const debtAssetPrice = debtAssetMarket.asset.price.amount
      const swapAssetPrice = swapAssetMarket.asset.price.amount

      const equivalentAmount = remainingDebtAfterDebtAsset
        .multipliedBy(debtAssetPrice)
        .shiftedBy(-debtAssetMarket.asset.decimals)
        .dividedBy(swapAssetPrice)
        .shiftedBy(swapAssetMarket.asset.decimals)
        .times(1.02)
        .integerValue()

      const maxBalance = repayFromWallet
        ? BN(walletBalances.find(byDenom(selectedSwapAsset.denom))?.amount ?? 0)
        : (account.deposits.find(byDenom(selectedSwapAsset.denom))?.amount ?? BN_ZERO).plus(
            account.lends.find(byDenom(selectedSwapAsset.denom))?.amount ?? BN_ZERO,
          )

      return BigNumber.min(maxBalance, equivalentAmount)
    }

    return swapAssetMax
  }, [
    isRepay,
    isDifferentAsset,
    selectedSwapAsset,
    useDebtAsset,
    remainingDebt,
    totalRepayable,
    markets,
    asset.denom,
    repayFromWallet,
    walletBalances,
    account.deposits,
    account.lends,
    swapAssetMax,
  ])

  useEffect(() => {
    if (isRepay && isDifferentAsset) {
      if (swapAssetAmount.isGreaterThan(adjustedSwapAssetMax)) {
        setSwapAssetAmount(adjustedSwapAssetMax)
      }
    }
  }, [isRepay, isDifferentAsset, adjustedSwapAssetMax, swapAssetAmount])

  useEffect(() => {
    const errors: string[] = []

    if (isRepay) {
      if (useDebtAsset && debtAssetAmount.isGreaterThan(debtAssetMax)) {
        errors.push(`Cannot repay more than ${debtAssetMax.toString()} ${asset.symbol}`)
      }

      if (selectedSwapAsset && swapAssetAmount.isGreaterThan(adjustedSwapAssetMax)) {
        errors.push(
          `Cannot use more than ${adjustedSwapAssetMax.toString()} ${selectedSwapAsset.symbol}`,
        )
      }

      if (
        hasUserInteracted &&
        useDebtAsset &&
        selectedSwapAsset &&
        debtAssetAmount.isZero() &&
        swapAssetAmount.isZero()
      ) {
        errors.push('Please enter an amount to repay')
      }
    } else {
      if (amount.isGreaterThan(max)) {
        errors.push(`Cannot borrow more than ${max.toString()} ${asset.symbol}`)
      }

      if (amount.isZero()) {
        errors.push('Please enter an amount to borrow')
      }
    }

    setValidationErrors(errors)
  }, [
    isRepay,
    useDebtAsset,
    selectedSwapAsset,
    debtAssetAmount,
    swapAssetAmount,
    amount,
    debtAssetMax,
    adjustedSwapAssetMax,
    max,
    asset.symbol,
    selectedSwapAsset?.symbol,
    hasUserInteracted,
  ])

  async function onConfirmClick() {
    if (!asset) return
    setLoadingState({ isLoading: true, action: isRepay ? 'repay' : 'borrow' })

    try {
      const success = false

      if (isRepay) {
        combinedRepay({
          accountId: account.id,
          debtAsset: asset,
          debtAmount: useDebtAsset ? debtAssetAmount : BN_ZERO,
          swapAsset: selectedSwapAsset || asset,
          swapAmount: selectedSwapAsset ? swapAssetAmount : BN_ZERO,
          fromWallet: repayFromWallet,
          slippage: slippage ?? 0.005,
          account: account,
        })
      } else {
        borrow({
          accountId: account.id,
          coin: BNCoin.fromDenomAndBigNumber(asset.denom, amount),
          borrowToWallet,
        })
      }
      resetState()
      useStore.setState({ borrowModal: null })
    } catch (error) {
      console.error('Transaction failed:', error)
      setLoadingState({ isLoading: false, action: 'none' })
    }
  }

  function onClose() {
    if (loadingState.isLoading) return
    resetState()
    useStore.setState({ borrowModal: null })
  }

  const availableRepaymentAssets = useMemo(() => {
    if (!isRepay) return []

    const availableAssets: Asset[] = []

    if (repayFromWallet) {
      const hasDebtAssetBalance = walletBalances.some(
        (bal) => bal.denom === asset.denom && BN(bal.amount).isGreaterThan(0),
      )

      if (hasDebtAssetBalance) {
        availableAssets.push(asset)
      }

      assets.forEach((a) => {
        if (a.denom !== asset.denom) {
          const hasBalance = walletBalances.some(
            (bal) => bal.denom === a.denom && BN(bal.amount).isGreaterThan(0),
          )
          if (hasBalance) {
            availableAssets.push(a)
          }
        }
      })
    } else {
      const debtDeposit = account.deposits.find((dep) => dep.denom === asset.denom)
      const debtLend = account.lends.find((lend) => lend.denom === asset.denom)

      if (
        (debtDeposit && debtDeposit.amount.isGreaterThan(0)) ||
        (debtLend && debtLend.amount.isGreaterThan(0))
      ) {
        availableAssets.push(asset)
      }

      assets.forEach((a) => {
        if (
          a.denom !== asset.denom &&
          !availableAssets.some((existingAsset) => existingAsset.denom === a.denom)
        ) {
          const deposit = account.deposits.find((dep) => dep.denom === a.denom)
          const lend = account.lends.find((lnd) => lnd.denom === a.denom)

          if (
            (deposit && deposit.amount.isGreaterThan(0)) ||
            (lend && lend.amount.isGreaterThan(0))
          ) {
            availableAssets.push(a)
          }
        }
      })
    }

    return availableAssets.sort((a, b) => a.symbol.localeCompare(b.symbol))
  }, [isRepay, repayFromWallet, walletBalances, account.deposits, account.lends, assets, asset])

  const handleDebtAssetChange = useCallback(
    (newAmount: BigNumber) => {
      if (debtAssetAmount.isEqualTo(newAmount)) return
      setDebtAssetAmount(newAmount)
      setHasUserInteracted(true)
      if (isRepay) {
        const swapAsset =
          selectedSwapAsset && swapAssetAmount.isGreaterThan(0) && isDifferentAsset
            ? BNCoin.fromDenomAndBigNumber(selectedSwapAsset.denom, swapAssetAmount)
            : null

        simulateCombinedRepay(
          BNCoin.fromDenomAndBigNumber(asset.denom, newAmount),
          swapAsset,
          asset.denom,
          repayFromWallet,
        )
      }
    },
    [
      asset.denom,
      debtAssetAmount,
      isRepay,
      repayFromWallet,
      simulateCombinedRepay,
      selectedSwapAsset,
      swapAssetAmount,
      isDifferentAsset,
    ],
  )

  const handleSwapAssetChange = useCallback(
    (newAmount: BigNumber) => {
      if (swapAssetAmount.isEqualTo(newAmount)) return
      setSwapAssetAmount(newAmount)
      setHasUserInteracted(true)

      if (isRepay && isDifferentAsset && selectedSwapAsset) {
        const debtAsset =
          useDebtAsset && debtAssetAmount.isGreaterThan(0)
            ? BNCoin.fromDenomAndBigNumber(asset.denom, debtAssetAmount)
            : null

        simulateCombinedRepay(
          debtAsset,
          newAmount.isGreaterThan(0)
            ? BNCoin.fromDenomAndBigNumber(selectedSwapAsset.denom, newAmount)
            : null,
          asset.denom,
          repayFromWallet,
        )
      }
    },
    [
      selectedSwapAsset,
      swapAssetAmount,
      isRepay,
      repayFromWallet,
      simulateCombinedRepay,
      useDebtAsset,
      asset.denom,
      isDifferentAsset,
      debtAssetAmount,
    ],
  )

  const handleChange = useCallback(
    (newAmount: BigNumber) => {
      if (amount.isEqualTo(newAmount)) return
      setAmount(newAmount)
      if (!isRepay) {
        setLoadingState({ isLoading: true, action: 'simulation' })
        const borrowCoin = BNCoin.fromDenomAndBigNumber(
          asset.denom,
          newAmount.isGreaterThan(max) ? max : newAmount,
        )
        const target = borrowToWallet ? 'wallet' : isAutoLendEnabled ? 'lend' : 'deposit'
        simulateBorrow(target, borrowCoin)
        setTimeout(() => {
          setLoadingState({ isLoading: false, action: 'none' })
        }, 500)
      }
    },
    [amount, asset.denom, borrowToWallet, isAutoLendEnabled, isRepay, max, simulateBorrow],
  )

  const maxBorrow = useMemo(() => {
    const maxBorrowAmount = isRepay
      ? BN_ZERO
      : computeMaxBorrowAmount(asset.denom, borrowToWallet ? 'wallet' : 'deposit')

    return BigNumber.min(maxBorrowAmount, modal.marketData?.liquidity || 0)
  }, [asset.denom, borrowToWallet, computeMaxBorrowAmount, isRepay, modal.marketData])

  useEffect(() => {
    if (!account || isRepay) return
    if (maxBorrow.isEqualTo(max)) return
    setMax(maxBorrow)
  }, [account, isRepay, maxBorrow, max])

  useEffect(() => {
    if (amount.isLessThanOrEqualTo(max)) return
    handleChange(max)
    setAmount(max)
  }, [amount, max, handleChange])

  const swapRouteDetails = useSwapRoute(
    selectedSwapAsset?.denom || '',
    asset.denom,
    swapAssetAmount,
    isRepay && isDifferentAsset && !!selectedSwapAsset,
  )

  const canRepay =
    isRepay &&
    ((useDebtAsset && debtAssetAmount.isGreaterThan(0)) ||
      (selectedSwapAsset && swapAssetAmount.isGreaterThan(0)))

  const accountHasRepaymentAssets = useMemo(() => {
    return availableRepaymentAssets.length > 0
  }, [availableRepaymentAssets])

  useEffect(() => {
    setHasUserMadeSelection(false)
    setUseDebtAsset(false)
    setSelectedSwapAsset(null)
    setDebtAssetAmount(BN_ZERO)
    setSwapAssetAmount(BN_ZERO)
  }, [repayFromWallet])

  useEffect(() => {
    if (isRepay && account && !hasUserMadeSelection) {
      const hasDebtAssetInAccount =
        account.deposits.some(byDenom(asset.denom)) || account.lends.some(byDenom(asset.denom))

      if (hasDebtAssetInAccount) {
        setUseDebtAsset(true)
      }
    }
  }, [isRepay, account, asset.denom, hasUserMadeSelection])

  const openAssetSelectionModal = () => {
    useStore.setState({
      accountAssetsModal: {
        debtAsset: asset,
        account,
        repayFromWallet,
        selectedDenoms: [
          ...(useDebtAsset ? [asset.denom] : []),
          ...(selectedSwapAsset ? [selectedSwapAsset.denom] : []),
        ],
        availableAssets: availableRepaymentAssets.filter((a) => a.denom === asset.denom),
        swapAssets: availableRepaymentAssets.filter((a) => a.denom !== asset.denom),
        onSelect: (selectedDenoms: string[]) => {
          const useSelectedDebtAsset = selectedDenoms.includes(asset.denom)

          let swapAsset: Asset | null = null
          for (const denom of selectedDenoms) {
            if (denom !== asset.denom) {
              swapAsset = assets.find((a) => a.denom === denom) || null
              break
            }
          }
          setHasUserMadeSelection(true)
          setUseDebtAsset(useSelectedDebtAsset)
          setSelectedSwapAsset(swapAsset)

          setDebtAssetAmount(BN_ZERO)
          setSwapAssetAmount(BN_ZERO)
        },
      },
    })
  }

  const buttonText = getButtonText(loadingState.isLoading, loadingState.action, isRepay)

  if (!account || !modal) {
    return null
  }

  return (
    <Modal
      onClose={onClose}
      header={
        <span className='flex items-center gap-4 px-2 md:px-4'>
          <AssetImage asset={asset} className='w-6 h-6' />
          <Text>
            {isRepay ? 'Repay' : 'Borrow'} {asset.symbol}
          </Text>
        </span>
      }
      headerClassName='gradient-header pl-2 pr-2.5 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col'
    >
      <div className='flex flex-wrap gap-4 p-4 border-b md:gap-6 md:px-6 md:py-4 border-white/5 gradient-header md:flex-nowrap'>
        <TitleAndSubCell
          containerClassName='w-full md:w-auto'
          title={formatPercent(modal.marketData.apy.borrow)}
          sub={'Borrow Rate APY'}
        />
        {accountDebt.isGreaterThan(0) && (
          <>
            <div className='flex flex-col gap-0.5 md:border-l md:border-white/10 md:pl-6 w-full md:w-auto'>
              <div className='flex gap-2'>
                <FormattedNumber
                  className='text-xs'
                  amount={accountDebt.toNumber()}
                  options={{
                    decimals: asset.decimals,
                    abbreviated: false,
                    suffix: ` ${asset.symbol}`,
                  }}
                />
                <DisplayCurrency
                  className='text-xs'
                  coin={BNCoin.fromDenomAndBigNumber(asset.denom, accountDebt)}
                  parentheses
                />
              </div>
              <Text size='xs' className='text-white/50' tag='span'>
                Total Borrowed
              </Text>
            </div>
          </>
        )}
        <div className='flex flex-col gap-0.5 md:border-l md:border-white/10 md:pl-6 w-full md:w-auto'>
          <div className='flex gap-2'>
            <FormattedNumber
              className='text-xs'
              amount={modal.marketData?.liquidity.toNumber() ?? 0}
              options={{ decimals: asset.decimals, abbreviated: true, suffix: ` ${asset.symbol}` }}
            />
            <DisplayCurrency
              className='text-xs'
              coin={BNCoin.fromDenomAndBigNumber(
                asset.denom,
                modal.marketData?.liquidity ?? BN_ZERO,
              )}
              parentheses
            />
          </div>
          <Text size='xs' className='text-white/50' tag='span'>
            Liquidity available
          </Text>
        </div>
      </div>
      <div
        className={classNames(
          'flex items-start flex-1 p-2 gap-4 flex-wrap',
          'md:p-4 md:gap-6',
          'lg:flex-nowrap lg:p-6',
        )}
      >
        <Card
          className='flex flex-1 w-full p-4 bg-white/5 max-w-screen-full min-w-[200px]'
          contentClassName='gap-6 flex flex-col justify-between h-full'
        >
          {isRepay ? (
            <>
              <div>
                <RepayAssets
                  useDebtAsset={useDebtAsset}
                  selectedSwapAsset={selectedSwapAsset}
                  asset={asset}
                  debtAssetAmount={debtAssetAmount}
                  debtAssetMax={debtAssetMax}
                  swapAssetAmount={swapAssetAmount}
                  adjustedSwapAssetMax={adjustedSwapAssetMax}
                  remainingDebt={remainingDebt}
                  totalRepayable={totalRepayable}
                  handleDebtAssetChange={handleDebtAssetChange}
                  handleSwapAssetChange={handleSwapAssetChange}
                  accountHasRepaymentAssets={accountHasRepaymentAssets}
                  hasDebtAsset={hasDebtAsset}
                  openAssetSelectionModal={openAssetSelectionModal}
                  account={account}
                />
              </div>

              {selectedSwapAsset && isDifferentAsset && swapAssetAmount.isGreaterThan(0) && (
                <SwapDetails
                  fromAsset={selectedSwapAsset}
                  toAsset={asset}
                  amount={swapAssetAmount}
                  expectedOutput={swapRouteDetails.expectedOutput}
                  slippage={slippage}
                  priceImpact={swapRouteDetails.priceImpact}
                  route={swapRouteDetails.route}
                  isLoading={swapRouteDetails.isLoading}
                  routeDescription={swapRouteDetails.routeDescription}
                />
              )}
            </>
          ) : (
            <TokenInputWithSlider
              asset={asset}
              onChange={handleChange}
              amount={amount}
              max={max}
              disabled={false}
              className='w-full'
              maxText='Max'
              warningMessages={[]}
              balances={account.deposits}
              accountId={account.id}
              hasSelect={false}
            />
          )}
          {isRepay ? (
            <>
              <Divider />
              <div className='flex items-center w-full'>
                <div className='flex flex-wrap flex-1'>
                  <Text className='w-full mb-1'>Repay from Wallet</Text>
                  <Text size='xs' className='text-white/50'>
                    Repay your debt directly from your wallet
                  </Text>
                </div>
                <Switch
                  name='borrow-to-wallet'
                  checked={repayFromWallet}
                  onChange={setRepayFromWallet}
                />
              </div>
            </>
          ) : (
            <>
              <Divider />
              <div className='flex items-center w-full'>
                <div className='flex flex-wrap flex-1'>
                  <Text className='w-full mb-1'>Receive funds to Wallet</Text>
                  <Text size='xs' className='text-white/50'>
                    Your borrowed funds will directly go to your wallet
                  </Text>
                </div>
                <Switch
                  name='borrow-to-wallet'
                  checked={borrowToWallet}
                  onChange={setBorrowToWallet}
                />
              </div>
            </>
          )}
          {validationErrors.length > 0 && (
            <div className='mt-2 p-2 border border-red-500/30 bg-red-500/10 rounded'>
              {validationErrors.map((error, index) => (
                <Text key={index} size='xs' className='text-red-400'>
                  {error}
                </Text>
              ))}
            </div>
          )}
          <Button
            onClick={onConfirmClick}
            className='w-full'
            disabled={
              (!isRepay && amount.isZero()) ||
              (isRepay && !canRepay) ||
              loadingState.isLoading ||
              validationErrors.length > 0
            }
            text={buttonText}
            rightIcon={loadingState.isLoading ? undefined : <ArrowRight />}
            showProgressIndicator={loadingState.isLoading}
          />
        </Card>
        <AccountSummaryInModal account={account} />
      </div>
    </Modal>
  )
}
