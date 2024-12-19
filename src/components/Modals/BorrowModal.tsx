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
import { ArrowRight, InfoCircle } from 'components/common/Icons'
import Switch from 'components/common/Switch'
import Text from 'components/common/Text'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import AssetImage from 'components/common/assets/AssetImage'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import { getDepositAndLendCoinsToSpend } from 'hooks/accounts/useUpdatedAccount/functions'
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

interface Props {
  account: Account
  modal: BorrowModal
}

function RepayNotAvailable(props: { asset: Asset; repayFromWallet: boolean }) {
  return (
    <Card className='w-full'>
      <div className='flex items-start p-4'>
        <InfoCircle className='w-6 mr-2 flex-0' />
        <div className='flex flex-col flex-1 gap-1'>
          <Text size='sm'>No funds for repay</Text>
          <Text size='xs' className='text-white/40'>{`Unfortunately you don't have any ${
            props.asset.symbol
          } in your ${
            props.repayFromWallet ? 'Wallet' : 'Credit Account'
          } to repay the debt.`}</Text>
        </div>
      </div>
    </Card>
  )
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
  const [borrowToWallet, setBorrowToWallet] = useToggle()
  const [repayFromWallet, setRepayFromWallet] = useToggle()
  const walletAddress = useStore((s) => s.address)
  const { data: walletBalances } = useWalletBalances(walletAddress)
  const borrow = useStore((s) => s.borrow)
  const repay = useStore((s) => s.repay)
  const asset = modal.asset
  const isRepay = modal.isRepay ?? false
  const [max, setMax] = useState(BN_ZERO)
  const { simulateBorrow, simulateRepay } = useUpdatedAccount(account)
  const apy = modal.marketData.apy.borrow
  const { isAutoLendEnabledForCurrentAccount: isAutoLendEnabled } = useAutoLend()
  const { computeMaxBorrowAmount } = useHealthComputer(account)
  const accountDebt = account.debts.find(byDenom(asset.denom))?.amount ?? BN_ZERO
  const markets = useMarkets()

  const [depositBalance, lendBalance] = useMemo(
    () => [
      account.deposits.find(byDenom(asset.denom))?.amount ?? BN_ZERO,
      account.lends.find(byDenom(asset.denom))?.amount ?? BN_ZERO,
    ],
    [account, asset.denom],
  )

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

  const maxRepayAmount = useMemo(() => {
    const maxBalance = repayFromWallet
      ? BN(walletBalances.find(byDenom(asset.denom))?.amount ?? 0)
      : depositBalance.plus(lendBalance)
    return isRepay
      ? BigNumber.min(maxBalance, overpayExeedsCap ? accountDebt : accountDebtWithInterest)
      : BN_ZERO
  }, [
    depositBalance,
    lendBalance,
    isRepay,
    accountDebtWithInterest,
    overpayExeedsCap,
    accountDebt,
    walletBalances,
    asset.denom,
    repayFromWallet,
  ])

  function resetState() {
    setAmount(BN_ZERO)
  }

  function onConfirmClick() {
    if (!asset) return
    const { lend } = getDepositAndLendCoinsToSpend(
      BNCoin.fromDenomAndBigNumber(asset.denom, amount),
      account,
    )
    if (isRepay) {
      repay({
        accountId: account.id,
        coin: BNCoin.fromDenomAndBigNumber(asset.denom, amount),
        accountBalance: amount.isEqualTo(accountDebtWithInterest),
        lend: repayFromWallet ? BNCoin.fromDenomAndBigNumber(asset.denom, BN_ZERO) : lend,
        fromWallet: repayFromWallet,
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
  }

  function onClose() {
    resetState()
    useStore.setState({ borrowModal: null })
  }

  const handleChange = useCallback(
    (newAmount: BigNumber) => {
      if (amount.isEqualTo(newAmount)) return
      setAmount(newAmount)
      if (isRepay) {
        const repayCoin = BNCoin.fromDenomAndBigNumber(
          asset.denom,
          newAmount.isGreaterThan(accountDebt) ? accountDebt : newAmount,
        )
        simulateRepay(repayCoin, repayFromWallet)
      } else {
        const borrowCoin = BNCoin.fromDenomAndBigNumber(
          asset.denom,
          newAmount.isGreaterThan(max) ? max : newAmount,
        )
        const target = borrowToWallet ? 'wallet' : isAutoLendEnabled ? 'lend' : 'deposit'
        simulateBorrow(target, borrowCoin)
      }
    },
    [
      accountDebt,
      amount,
      asset.denom,
      borrowToWallet,
      isAutoLendEnabled,
      isRepay,
      max,
      repayFromWallet,
      simulateBorrow,
      simulateRepay,
    ],
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
    if (!isRepay) return
    if (maxRepayAmount.isEqualTo(max)) return
    setMax(maxRepayAmount)
  }, [isRepay, max, maxRepayAmount])

  useEffect(() => {
    if (amount.isLessThanOrEqualTo(max)) return
    handleChange(max)
    setAmount(max)
  }, [amount, max, handleChange])

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
          <TokenInputWithSlider
            asset={asset}
            onChange={handleChange}
            amount={amount}
            max={max}
            disabled={max.isZero()}
            className='w-full'
            maxText='Max'
            warningMessages={[]}
          />
          {isRepay && maxRepayAmount.isZero() && (
            <RepayNotAvailable asset={asset} repayFromWallet={repayFromWallet} />
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
            disabled={amount.isZero()}
            text={isRepay ? 'Repay' : 'Borrow'}
            rightIcon={<ArrowRight />}
          />
        </Card>
        <AccountSummaryInModal account={account} />
      </div>
    </Modal>
  )
}
