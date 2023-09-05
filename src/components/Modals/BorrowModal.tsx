import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'

import AccountSummary from 'components/Account/AccountSummary'
import AssetImage from 'components/AssetImage'
import Button from 'components/Button'
import Card from 'components/Card'
import DisplayCurrency from 'components/DisplayCurrency'
import Divider from 'components/Divider'
import { FormattedNumber } from 'components/FormattedNumber'
import { ArrowRight } from 'components/Icons'
import Modal from 'components/Modal'
import Switch from 'components/Switch'
import Text from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'
import TokenInputWithSlider from 'components/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import useAutoLendEnabledAccountIds from 'hooks/useAutoLendEnabledAccountIds'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useHealthComputer from 'hooks/useHealthComputer'
import useToggle from 'hooks/useToggle'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'
import { getDepositAndLendCoinsToSpend } from 'hooks/useUpdatedAccount/functions'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { formatPercent, formatValue } from 'utils/formatters'
import { BN } from 'utils/helpers'

function getDebtAmount(modal: BorrowModal) {
  return BN((modal.marketData as BorrowMarketTableData)?.debt ?? 0).toString()
}

function getAssetLogo(modal: BorrowModal) {
  if (!modal.asset) return null
  return <AssetImage asset={modal.asset} size={24} />
}

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
  const [isConfirming, setIsConfirming] = useToggle()
  const [borrowToWallet, setBorrowToWallet] = useToggle()
  const borrow = useStore((s) => s.borrow)
  const repay = useStore((s) => s.repay)
  const asset = modal.asset
  const isRepay = modal.isRepay ?? false
  const [max, setMax] = useState(BN_ZERO)
  const { simulateBorrow, simulateRepay } = useUpdatedAccount(account)

  const { autoLendEnabledAccountIds } = useAutoLendEnabledAccountIds()
  const isAutoLendEnabled = autoLendEnabledAccountIds.includes(account.id)
  const { computeMaxBorrowAmount } = useHealthComputer(account)

  function resetState() {
    setAmount(BN_ZERO)
    setIsConfirming(false)
  }

  async function onConfirmClick() {
    if (!asset) return
    setIsConfirming(true)
    let result
    const { lend } = getDepositAndLendCoinsToSpend(
      BNCoin.fromDenomAndBigNumber(asset.denom, amount),
      account,
    )
    if (isRepay) {
      result = await repay({
        accountId: account.id,
        coin: BNCoin.fromDenomAndBigNumber(asset.denom, amount),
        accountBalance: max.isEqualTo(amount),
        lend,
      })
    } else {
      result = await borrow({
        accountId: account.id,
        coin: BNCoin.fromDenomAndBigNumber(asset.denom, amount),
        borrowToWallet,
      })
    }

    setIsConfirming(false)
    if (result) {
      resetState()
      useStore.setState({ borrowModal: null })
    }
  }

  function onClose() {
    resetState()
    useStore.setState({ borrowModal: null })
  }

  const handleChange = useCallback(
    (newAmount: BigNumber) => {
      const coin = BNCoin.fromDenomAndBigNumber(asset.denom, newAmount)
      if (!amount.isEqualTo(newAmount)) setAmount(newAmount)
      if (isRepay) simulateRepay(coin)
    },
    [asset, amount, isRepay, simulateRepay],
  )

  useEffect(() => {
    if (!account) return
    if (isRepay) {
      const depositBalance = account.deposits.find(byDenom(asset.denom))?.amount ?? BN_ZERO
      const lendBalance = account.lends.find(byDenom(asset.denom))?.amount ?? BN_ZERO
      const maxBalance = depositBalance.plus(lendBalance)
      const totalDebt = BN(getDebtAmount(modal))
      const maxRepayAmount = BigNumber.min(maxBalance, totalDebt)
      setMax(maxRepayAmount)
      return
    }

    const maxBorrowAmount = computeMaxBorrowAmount(
      asset.denom,
      borrowToWallet ? 'wallet' : 'deposit',
    )

    setMax(BigNumber.min(maxBorrowAmount, modal.marketData?.liquidity?.amount || 0))
  }, [account, isRepay, modal, asset.denom, computeMaxBorrowAmount, borrowToWallet])

  useEffect(() => {
    if (amount.isGreaterThan(max)) {
      handleChange(max)
      setAmount(max)
    }
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
          sub={'Borrow rate'}
        />
        <div className='h-100 w-[1px] bg-white/10' />
        <TitleAndSubCell
          title={formatValue(getDebtAmount(modal), {
            abbreviated: false,
            decimals: asset.decimals,
            maxDecimals: asset.decimals,
          })}
          sub={'Borrowed'}
        />
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
              className='w-full'
              maxText='Max'
              disabled={isConfirming}
            />
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
                    disabled={isConfirming}
                  />
                </div>
              </>
            )}
          </div>
          <Button
            onClick={onConfirmClick}
            className='w-full'
            showProgressIndicator={isConfirming}
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