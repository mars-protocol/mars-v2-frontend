import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useCallback, useEffect, useMemo, useState } from 'react'

import AccountSummaryInModal from 'components/account/AccountSummary/AccountSummaryInModal'
import AssetImage from 'components/common/assets/AssetImage'
import Button from 'components/common/Button'
import Card from 'components/common/Card'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Divider from 'components/common/Divider'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { ArrowRight, InfoCircle } from 'components/common/Icons'
import Text from 'components/common/Text'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import Modal from 'components/Modals/Modal'
import { BN_ZERO } from 'constants/math'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useBaseAsset from 'hooks/assets/useBaseAsset'
import useMarkets from 'hooks/markets/useMarkets'
import useCurrentWalletBalance from 'hooks/wallet/useCurrentWalletBalance'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { formatPercent } from 'utils/formatters'
import { BN } from 'utils/helpers'
import { getDebtAmountWithInterest } from 'utils/tokens'

interface Props {
  account: Account
}

function RepayNotAvailable(props: { asset: Asset }) {
  return (
    <Card className='w-full'>
      <div className='flex items-start p-4'>
        <InfoCircle className='w-6 mr-2 flex-0' />
        <div className='flex flex-col flex-1 gap-1'>
          <Text size='sm'>No funds for repay</Text>
          <Text
            size='xs'
            className='text-white/40'
          >{`Unfortunately you don't have any ${props.asset.symbol} in your Wallet to repay the debt.`}</Text>
        </div>
      </div>
    </Card>
  )
}

export default function Repay(props: Props) {
  const { account } = props
  const modal = useStore((s) => s.v1BorrowAndRepayModal)
  const baseAsset = useBaseAsset()
  const asset = modal?.data.asset ?? baseAsset
  const [amount, setAmount] = useState(BN_ZERO)
  const balance = useCurrentWalletBalance(asset.denom)
  const v1Action = useStore((s) => s.v1Action)
  const [max, setMax] = useState(BN_ZERO)
  const { simulateRepay } = useUpdatedAccount(account)
  const apy = modal?.data.apy.borrow ?? 0
  const accountDebt = modal?.data.accountDebtAmount ?? BN_ZERO
  const markets = useMarkets()

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
    const maxBalance = BN(balance?.amount ?? 0)
    return BigNumber.min(maxBalance, overpayExeedsCap ? accountDebt : accountDebtWithInterest)
  }, [accountDebtWithInterest, overpayExeedsCap, accountDebt, balance?.amount])

  const close = useCallback(() => {
    setAmount(BN_ZERO)
    useStore.setState({ v1BorrowAndRepayModal: null })
  }, [setAmount])

  const onConfirmClick = useCallback(() => {
    v1Action('repay', BNCoin.fromDenomAndBigNumber(asset.denom, amount))
    close()
  }, [v1Action, asset, amount, close])

  const handleChange = useCallback(
    (newAmount: BigNumber) => {
      if (!amount.isEqualTo(newAmount)) setAmount(newAmount)
      const repayCoin = BNCoin.fromDenomAndBigNumber(
        asset.denom,
        newAmount.isGreaterThan(accountDebt) ? accountDebt : newAmount,
      )
      simulateRepay(repayCoin, true)
    },
    [accountDebt, amount, asset.denom, simulateRepay],
  )

  useEffect(() => {
    if (maxRepayAmount.isEqualTo(max)) return
    setMax(maxRepayAmount)
  }, [max, maxRepayAmount])

  useEffect(() => {
    if (amount.isLessThanOrEqualTo(max)) return
    handleChange(max)
    setAmount(max)
  }, [amount, max, handleChange])

  if (!modal) return null

  return (
    <Modal
      onClose={close}
      header={
        <span className='flex items-center gap-4 px-2 md:px-4'>
          <AssetImage asset={modal.data.asset} className='w-6 h-6' />
          <Text>
            {'Repay'} {asset.symbol}
          </Text>
        </span>
      }
      headerClassName='bg-surface-dark pl-2 pr-2.5 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col'
    >
      <div className='flex flex-wrap gap-4 p-4 border-b md:gap-6 md:px-6 md:py-4 border-white/5 bg-surface-dark md:flex-nowrap'>
        <TitleAndSubCell title={formatPercent(apy)} sub={'Borrow Rate APY'} />

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
        <div className='flex flex-col gap-0.5 md:border-l md:border-white/10 md:pl-6 w-full md:w-auto'>
          <div className='flex gap-2'>
            <FormattedNumber
              className='text-xs'
              amount={modal.data?.liquidity.toNumber() ?? 0}
              options={{ decimals: asset.decimals, abbreviated: true, suffix: ` ${asset.symbol}` }}
            />
            <DisplayCurrency
              className='text-xs'
              coin={BNCoin.fromDenomAndBigNumber(asset.denom, modal.data?.liquidity ?? BN_ZERO)}
              parentheses
            />
          </div>
          <Text size='xs' className='text-white/50' tag='span'>
            Liquidity available
          </Text>
        </div>
      </div>
      <div className='flex items-start flex-1 p-2 gap-1 flex-wrap bg-body'>
        <Card
          className='flex flex-1 w-full p-4 max-w-screen-full min-w-[200px]'
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
          <Divider />
          {maxRepayAmount.isZero() && <RepayNotAvailable asset={asset} />}
          <Button
            onClick={onConfirmClick}
            className='w-full'
            disabled={amount.isZero()}
            text={`Repay ${asset.symbol}`}
            rightIcon={<ArrowRight />}
          />
        </Card>
        <AccountSummaryInModal account={account} />
      </div>
    </Modal>
  )
}
