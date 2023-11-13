import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState } from 'react'

import AccountSummary from 'components/Account/AccountSummary'
import AssetImage from 'components/Asset/AssetImage'
import Button from 'components/Button'
import Card from 'components/Card'
import DisplayCurrency from 'components/DisplayCurrency'
import Divider from 'components/Divider'
import { FormattedNumber } from 'components/FormattedNumber'
import { ArrowRight, InfoCircle } from 'components/Icons'
import Modal from 'components/Modal'
import Switch from 'components/Switch'
import Text from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'
import TokenInputWithSlider from 'components/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import useAutoLend from 'hooks/useAutoLend'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useHealthComputer from 'hooks/useHealthComputer'
import useToggle from 'hooks/useToggle'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'
import { getDepositAndLendCoinsToSpend } from 'hooks/useUpdatedAccount/functions'
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

function getDebtAmount(modal: BorrowModal) {
  return BN((modal.marketData as BorrowMarketTableData)?.debt ?? 0).toString()
}

function getAssetLogo(modal: BorrowModal) {
  if (!modal.asset) return null
  return <AssetImage asset={modal.asset} size={24} />
}

function RepayNotAvailable(props: { asset: Asset }) {
  return (
    <Card className='mt-6'>
      <div className='flex items-start p-4'>
        <InfoCircle width={26} className='mr-2' />
        <div className='flex flex-col gap-1'>
          <Text size='sm'>No funds for repay</Text>
          <Text
            size='xs'
            className='text-white/40'
          >{`Unfortunately you don't have any ${props.asset.symbol} in your Credit Account to repay the debt.`}</Text>
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
  const borrow = useStore((s) => s.borrow)
  const repay = useStore((s) => s.repay)
  const asset = modal.asset
  const isRepay = modal.isRepay ?? false
  const [max, setMax] = useState(BN_ZERO)
  const { simulateBorrow, simulateRepay } = useUpdatedAccount(account)
  const { autoLendEnabledAccountIds } = useAutoLend()
  const apr = modal.marketData?.borrowRate ?? '0'
  const isAutoLendEnabled = autoLendEnabledAccountIds.includes(account.id)
  const { computeMaxBorrowAmount } = useHealthComputer(account)
  const totalDebt = BN(getDebtAmount(modal))

  const [depositBalance, lendBalance] = useMemo(
    () => [
      account.deposits.find(byDenom(asset.denom))?.amount ?? BN_ZERO,
      account.lends.find(byDenom(asset.denom))?.amount ?? BN_ZERO,
    ],
    [account, asset.denom],
  )

  const totalDebtRepayAmount = useMemo(
    () => getDebtAmountWithInterest(totalDebt, Number(apr)),
    [totalDebt, apr],
  )

  const maxRepayAmount = useMemo(() => {
    const maxBalance = depositBalance.plus(lendBalance)
    return isRepay ? BigNumber.min(maxBalance, totalDebtRepayAmount) : BN_ZERO
  }, [depositBalance, lendBalance, isRepay, totalDebtRepayAmount])

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
        accountBalance: amount.isEqualTo(totalDebtRepayAmount),
        lend,
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
      const coin = BNCoin.fromDenomAndBigNumber(asset.denom, newAmount)
      if (!amount.isEqualTo(newAmount)) setAmount(newAmount)
      if (!isRepay) return
      const repayCoin = coin.amount.isGreaterThan(totalDebt)
        ? BNCoin.fromDenomAndBigNumber(asset.denom, totalDebt)
        : coin
      simulateRepay(repayCoin)
    },
    [amount, asset.denom, isRepay, simulateRepay, totalDebt],
  )

  const maxBorrow = useMemo(() => {
    const maxBorrowAmount = isRepay
      ? BN_ZERO
      : computeMaxBorrowAmount(asset.denom, borrowToWallet ? 'wallet' : 'deposit')

    return BigNumber.min(maxBorrowAmount, modal.marketData?.liquidity?.amount || 0)
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

  useEffect(() => {
    if (isRepay) return
    const coin = BNCoin.fromDenomAndBigNumber(asset.denom, amount.isGreaterThan(max) ? max : amount)
    const target = borrowToWallet ? 'wallet' : isAutoLendEnabled ? 'lend' : 'deposit'
    simulateBorrow(target, coin)
  }, [isRepay, borrowToWallet, isAutoLendEnabled, simulateBorrow, asset, amount, max])

  if (!modal || !asset) return null
  return (
    <Modal
      onClose={onClose}
      header={
        <span className='flex items-center gap-4 px-4'>
          {getAssetLogo(modal)}
          <Text>
            {isRepay ? 'Repay' : 'Borrow'} {asset.symbol}
          </Text>
        </span>
      }
      headerClassName='gradient-header pl-2 pr-2.5 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col'
    >
      <div className='flex gap-3 px-6 py-4 border-b border-white/5 gradient-header'>
        <TitleAndSubCell
          title={formatPercent(modal.marketData.borrowRate || '0')}
          sub={'Borrow Rate APY'}
        />
        {totalDebt.isGreaterThan(0) && (
          <>
            <div className='h-100 w-[1px] bg-white/10' />
            <div className='flex flex-col gap-0.5'>
              <div className='flex gap-2'>
                <FormattedNumber
                  className='text-xs'
                  amount={totalDebt.toNumber()}
                  options={{
                    decimals: asset.decimals,
                    abbreviated: false,
                    suffix: ` ${asset.symbol}`,
                  }}
                />
                <DisplayCurrency
                  className='text-xs'
                  coin={BNCoin.fromDenomAndBigNumber(asset.denom, totalDebt)}
                  parentheses
                />
              </div>
              <Text size='xs' className='text-white/50' tag='span'>
                Borrowed
              </Text>
            </div>
          </>
        )}
        <div className='h-100 w-[1px] bg-white/10' />
        <div className='flex flex-col gap-0.5'>
          <div className='flex gap-2'>
            <FormattedNumber
              className='text-xs'
              amount={modal.marketData?.liquidity?.amount.toNumber() ?? 0}
              options={{ decimals: asset.decimals, abbreviated: true, suffix: ` ${asset.symbol}` }}
              animate
            />
            <DisplayCurrency
              className='text-xs'
              coin={BNCoin.fromDenomAndBigNumber(
                asset.denom,
                modal.marketData?.liquidity?.amount ?? BN_ZERO,
              )}
              parentheses
            />
          </div>
          <Text size='xs' className='text-white/50' tag='span'>
            Liquidity available
          </Text>
        </div>
      </div>
      <div className='flex items-start flex-1 gap-6 p-6'>
        <Card
          className='flex flex-1 p-4 bg-white/5'
          contentClassName='gap-6 flex flex-col justify-between h-full min-h-[380px]'
        >
          <div className='flex flex-wrap w-full'>
            <TokenInputWithSlider
              asset={asset}
              onChange={handleChange}
              amount={amount}
              max={max}
              disabled={max.isZero()}
              className='w-full'
              maxText='Max'
            />
            {isRepay && maxRepayAmount.isZero() && <RepayNotAvailable asset={asset} />}
            {!isRepay && (
              <>
                <Divider className='my-6' />
                <div className='flex flex-wrap flex-1'>
                  <Text className='w-full mb-1'>Receive funds to Wallet</Text>
                  <Text size='xs' className='text-white/50'>
                    Your borrowed funds will directly go to your wallet
                  </Text>
                </div>
                <div className='flex flex-wrap items-center justify-end'>
                  <Switch
                    name='borrow-to-wallet'
                    checked={borrowToWallet}
                    onChange={setBorrowToWallet}
                  />
                </div>
              </>
            )}
          </div>
          <Button
            onClick={onConfirmClick}
            className='w-full'
            disabled={amount.isZero()}
            text={isRepay ? 'Repay' : 'Borrow'}
            rightIcon={<ArrowRight />}
          />
        </Card>
        <AccountSummary account={account} />
      </div>
    </Modal>
  )
}
