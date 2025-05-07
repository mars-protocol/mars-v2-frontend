import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useCallback, useEffect, useMemo, useState } from 'react'

import Modal from 'components/Modals/Modal'
import AccountSummaryInModal from 'components/account/AccountSummary/AccountSummaryInModal'
import Button from 'components/common/Button'
import Card from 'components/common/Card'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Divider from 'components/common/Divider'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { ArrowRight, Plus } from 'components/common/Icons'
import Switch from 'components/common/Switch'
import Text from 'components/common/Text'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import AssetImage from 'components/common/assets/AssetImage'
import SwapDetails from 'components/common/SwapDetails/SwapDetails'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useToggle from 'hooks/common/useToggle'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useMarkets from 'hooks/markets/useMarkets'
import useAutoLend from 'hooks/wallet/useAutoLend'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { formatPercent } from 'utils/formatters'
import { BN } from 'utils/helpers'
import { getDebtAmountWithInterest } from 'utils/tokens'
import useSlippage from 'hooks/settings/useSlippage'
import useSwapRoute, { combinedRepay } from 'hooks/swap/useSwapRoute'

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
  const [amount, setAmount] = useState(BN_ZERO)
  const [debtAssetAmount, setDebtAssetAmount] = useState(BN_ZERO)
  const [swapAssetAmount, setSwapAssetAmount] = useState(BN_ZERO)
  const [borrowToWallet, setBorrowToWallet] = useToggle()
  const [repayFromWallet, setRepayFromWallet] = useToggle()
  const [isLoading, setIsLoading] = useToggle(false)
  const [useDebtAsset, setUseDebtAsset] = useState(false)
  const [selectedSwapAsset, setSelectedSwapAsset] = useState<Asset | null>(null)
  const walletAddress = useStore((s) => s.address)
  const { data: walletBalances } = useWalletBalances(walletAddress)
  const borrow = useStore((s) => s.borrow)
  const assets = useStore((s) => s.assets)
  const asset = modal.asset
  const isRepay = modal.isRepay ?? false
  const [max, setMax] = useState(BN_ZERO)
  const [debtAssetMax, setDebtAssetMax] = useState(BN_ZERO)
  const [swapAssetMax, setSwapAssetMax] = useState(BN_ZERO)
  const { simulateBorrow, simulateRepay } = useUpdatedAccount(account)
  const apy = modal.marketData.apy.borrow
  const { isAutoLendEnabledForCurrentAccount: isAutoLendEnabled } = useAutoLend()
  const { computeMaxBorrowAmount } = useHealthComputer(account)
  const accountDebt = account.debts.find(byDenom(asset.denom))?.amount ?? BN_ZERO
  const markets = useMarkets()
  const [slippage] = useSlippage()

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
      : (account.deposits.find(byDenom(asset.denom))?.amount ??
        BN_ZERO.plus(account.lends.find(byDenom(asset.denom))?.amount ?? BN_ZERO))

    const borrowedAmount = overpayExeedsCap ? accountDebt : accountDebtWithInterest
    const maxDebtAmount = BigNumber.min(maxDebtBalance, borrowedAmount)

    let maxSwapBalance = BN_ZERO
    let equivalentSwapAmount = BN_ZERO

    if (selectedSwapAsset) {
      maxSwapBalance = repayFromWallet
        ? BN(walletBalances.find(byDenom(selectedSwapAsset.denom))?.amount ?? 0)
        : (account.deposits.find(byDenom(selectedSwapAsset.denom))?.amount ??
          BN_ZERO.plus(account.lends.find(byDenom(selectedSwapAsset.denom))?.amount ?? BN_ZERO))

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

  const hasDebtAsset = useMemo(() => {
    if (!isRepay) return false

    return maxDebtAssetAmount.isGreaterThan(0)
  }, [isRepay, maxDebtAssetAmount])

  useEffect(() => {
    if (isRepay) {
      setDebtAssetMax(maxDebtAssetAmount)
      setSwapAssetMax(maxSwapAssetAmount)
    }
  }, [isRepay, maxDebtAssetAmount, maxSwapAssetAmount])

  function resetState() {
    setAmount(BN_ZERO)
    setDebtAssetAmount(BN_ZERO)
    setSwapAssetAmount(BN_ZERO)
    setIsLoading(false)
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
        : (account.deposits.find(byDenom(selectedSwapAsset.denom))?.amount ??
          BN_ZERO.plus(account.lends.find(byDenom(selectedSwapAsset.denom))?.amount ?? BN_ZERO))

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

  async function onConfirmClick() {
    if (!asset) return
    setIsLoading(true)

    try {
      let success = false

      if (isRepay) {
        success = await combinedRepay({
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
        success = await borrow({
          accountId: account.id,
          coin: BNCoin.fromDenomAndBigNumber(asset.denom, amount),
          borrowToWallet,
        })
      }

      if (success) {
        resetState()
        useStore.setState({ borrowModal: null })
      } else {
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Transaction failed:', error)
      setIsLoading(false)
    }
  }

  function onClose() {
    if (isLoading) return
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

      if (isRepay) {
        const repayCoin = BNCoin.fromDenomAndBigNumber(asset.denom, newAmount)
        simulateRepay(repayCoin, repayFromWallet)
      }
    },
    [asset.denom, debtAssetAmount, isRepay, repayFromWallet, simulateRepay],
  )

  const handleSwapAssetChange = useCallback(
    (newAmount: BigNumber) => {
      if (swapAssetAmount.isEqualTo(newAmount)) return
      setSwapAssetAmount(newAmount)

      if (isRepay && isDifferentAsset && selectedSwapAsset) {
        const repayCoin = BNCoin.fromDenomAndBigNumber(selectedSwapAsset.denom, newAmount)
        simulateRepay(repayCoin, repayFromWallet, asset.denom)
      }
    },
    [
      selectedSwapAsset,
      swapAssetAmount,
      isRepay,
      repayFromWallet,
      simulateRepay,
      asset.denom,
      isDifferentAsset,
    ],
  )

  const handleChange = useCallback(
    (newAmount: BigNumber) => {
      if (amount.isEqualTo(newAmount)) return
      setAmount(newAmount)
      if (!isRepay) {
        const borrowCoin = BNCoin.fromDenomAndBigNumber(
          asset.denom,
          newAmount.isGreaterThan(max) ? max : newAmount,
        )
        const target = borrowToWallet ? 'wallet' : isAutoLendEnabled ? 'lend' : 'deposit'
        simulateBorrow(target, borrowCoin)
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
    setUseDebtAsset(false)
    setSelectedSwapAsset(null)
    setDebtAssetAmount(BN_ZERO)
    setSwapAssetAmount(BN_ZERO)
  }, [repayFromWallet])

  useEffect(() => {
    if (isRepay && account) {
      const hasDebtAssetInAccount =
        account.deposits.some(byDenom(asset.denom)) || account.lends.some(byDenom(asset.denom))

      if (hasDebtAssetInAccount) {
        setUseDebtAsset(true)
      }
    }
  }, [isRepay, account, asset.denom])

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

          setUseDebtAsset(useSelectedDebtAsset)
          setSelectedSwapAsset(swapAsset)

          setDebtAssetAmount(BN_ZERO)
          setSwapAssetAmount(BN_ZERO)
        },
      },
    })
  }

  if (!modal || !asset) return null
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
                <div className='flex justify-between items-center mb-4'>
                  <Text>Select Assets to Repay</Text>
                  {accountHasRepaymentAssets && (
                    <Button
                      text='Select Assets'
                      color='tertiary'
                      rightIcon={<Plus />}
                      iconClassName='w-3'
                      onClick={openAssetSelectionModal}
                    />
                  )}
                </div>

                {!useDebtAsset && !selectedSwapAsset ? (
                  <div className='flex flex-col items-center justify-center py-10 text-center'>
                    <Text className='mb-2'>No assets selected for repayment</Text>
                    <Text size='xs' className='text-white/50 mb-4'>
                      Click "Select Assets" to choose which assets to use for repayment
                    </Text>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {useDebtAsset && hasDebtAsset && (
                      <div>
                        <Text size='sm' className='mb-2 text-white/70'>
                          Debt Asset {asset.symbol && `(${asset.symbol})`}
                        </Text>
                        <TokenInputWithSlider
                          asset={asset}
                          onChange={handleDebtAssetChange}
                          amount={debtAssetAmount}
                          max={debtAssetMax}
                          disabled={false}
                          className='w-full'
                          maxText='Max'
                          warningMessages={[]}
                          balances={account.deposits}
                          accountId={account.id}
                          hasSelect={false}
                        />

                        {debtAssetAmount.isGreaterThan(0) &&
                          debtAssetAmount.isLessThan(totalRepayable) && (
                            <Text size='xs' className='mt-2 text-white/50'>
                              Remaining debt:{' '}
                              <FormattedNumber
                                amount={remainingDebt.toNumber()}
                                options={{
                                  decimals: asset.decimals,
                                  suffix: ` ${asset.symbol}`,
                                }}
                              />
                            </Text>
                          )}
                      </div>
                    )}

                    {selectedSwapAsset && (
                      <div>
                        <Text size='sm' className='mb-2 text-white/70'>
                          Swap {selectedSwapAsset.symbol} to {asset.symbol}
                        </Text>
                        <TokenInputWithSlider
                          asset={selectedSwapAsset}
                          onChange={handleSwapAssetChange}
                          amount={swapAssetAmount}
                          max={adjustedSwapAssetMax}
                          disabled={false}
                          className='w-full'
                          maxText='Max'
                          warningMessages={[]}
                          balances={account.deposits}
                          accountId={account.id}
                          hasSelect={false}
                        />
                      </div>
                    )}
                  </div>
                )}
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
          <Button
            onClick={onConfirmClick}
            className='w-full'
            disabled={(!isRepay && amount.isZero()) || (isRepay && !canRepay) || isLoading}
            text={isLoading ? 'Processing...' : isRepay ? 'Repay' : 'Borrow'}
            rightIcon={isLoading ? undefined : <ArrowRight />}
            showProgressIndicator={isLoading}
          />
        </Card>
        <AccountSummaryInModal account={account} />
      </div>
    </Modal>
  )
}
