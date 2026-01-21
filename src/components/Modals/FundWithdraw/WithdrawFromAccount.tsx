import BigNumber from 'bignumber.js'
import { useCallback, useMemo, useState } from 'react'

import Button from 'components/common/Button'
import Divider from 'components/common/Divider'
import { ArrowRight } from 'components/common/Icons'
import Switch from 'components/common/Switch'
import Text from 'components/common/Text'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useAssets from 'hooks/assets/useAssets'
import useToggle from 'hooks/common/useToggle'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useMarket from 'hooks/markets/useMarket'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { cloneAccount, removeDepositsAndLends } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { mergeBNCoinArrays } from 'utils/helpers'
import { getCoinValue } from 'utils/formatters'

interface Props {
  account: Account
}

export default function WithdrawFromAccount(props: Props) {
  const { account } = props
  const { data: assets } = useAssets()
  const nonPoolTokens = useMemo(() => assets.filter((asset) => !asset.isPoolToken), [assets])
  const sortedBalances = useMemo(
    () =>
      mergeBNCoinArrays(account.deposits, account.lends)
        .filter((coin) => nonPoolTokens.some((asset) => asset.denom === coin.denom))
        .sort((a, b) => {
          const valueA = getCoinValue(a, nonPoolTokens)?.toNumber?.() ?? 0
          const valueB = getCoinValue(b, nonPoolTokens)?.toNumber?.() ?? 0
          return valueB - valueA
        }),
    [account.deposits, account.lends, nonPoolTokens],
  )
  const defaultAsset = useMemo(
    () => nonPoolTokens.find(byDenom(sortedBalances[0]?.denom)) ?? nonPoolTokens[0],
    [sortedBalances, nonPoolTokens],
  )

  const withdraw = useStore((s) => s.withdraw)
  const [withdrawWithBorrowing, setWithdrawWithBorrowing] = useToggle()
  const [currentAsset, setCurrentAsset] = useState<Asset>(defaultAsset)
  const [amount, setAmount] = useState(BN_ZERO)
  const { simulateWithdraw } = useUpdatedAccount(account)
  const { computeMaxWithdrawAmount } = useHealthComputer(account)
  const accountClone = cloneAccount(account)
  const borrowAccount = removeDepositsAndLends(accountClone, currentAsset.denom)
  const { computeMaxBorrowAmount } = useHealthComputer(borrowAccount)

  const market = useMarket(currentAsset.denom)
  const accountDeposit = account.deposits.find(byDenom(currentAsset.denom))?.amount ?? BN_ZERO
  const accountLent = account.lends.find(byDenom(currentAsset.denom))?.amount ?? BN_ZERO
  const shouldReclaim = amount.isGreaterThan(accountDeposit) && !accountLent.isZero()
  const isReclaimingMaxAmount = accountLent.isLessThanOrEqualTo(amount.minus(accountDeposit))

  const reclaimAmount = isReclaimingMaxAmount ? amount : amount.minus(accountDeposit)
  const isDeprecatedAsset = currentAsset.isDeprecated
  const isBorrowEnabledAsset = currentAsset.isBorrowEnabled
  const healthBasedMaxWithdraw =
    isDeprecatedAsset || !isBorrowEnabledAsset
      ? (sortedBalances.find(byDenom(currentAsset.denom))?.amount ?? BN_ZERO)
      : computeMaxWithdrawAmount(currentAsset.denom)
  // Cap max withdraw by available liquidity when reclaiming from lends
  const availableLiquidity = market?.liquidity ?? BN_ZERO
  const maxWithdrawAmount = useMemo(() => {
    // If user has lent assets, cap total withdraw by deposits + available liquidity
    if (accountLent.isGreaterThan(0)) {
      const maxFromLiquidity = accountDeposit.plus(BigNumber.min(accountLent, availableLiquidity))
      return BigNumber.min(healthBasedMaxWithdraw, maxFromLiquidity)
    }
    return healthBasedMaxWithdraw
  }, [healthBasedMaxWithdraw, accountDeposit, accountLent, availableLiquidity])
  const maxWithdrawWithBorrowAmount =
    isDeprecatedAsset || !isBorrowEnabledAsset
      ? maxWithdrawAmount
      : computeMaxBorrowAmount(currentAsset.denom, 'wallet').plus(maxWithdrawAmount)

  const [debtAmount, max] = useMemo(() => {
    const isWithinBalance = amount.isLessThan(maxWithdrawAmount)
    const debtAmount = isWithinBalance ? BN_ZERO : amount.minus(maxWithdrawAmount)
    const max = withdrawWithBorrowing ? maxWithdrawWithBorrowAmount : maxWithdrawAmount

    return [debtAmount, max]
  }, [amount, maxWithdrawAmount, maxWithdrawWithBorrowAmount, withdrawWithBorrowing])

  const onConfirm = useCallback(() => {
    const coins = [
      {
        coin: BNCoin.fromDenomAndBigNumber(currentAsset.denom, amount),
        isMax: max.isEqualTo(amount),
      },
    ]
    const borrow = !debtAmount.isZero()
      ? [BNCoin.fromDenomAndBigNumber(currentAsset.denom, debtAmount)]
      : []
    const reclaims =
      shouldReclaim && !reclaimAmount.isZero()
        ? [
            BNCoin.fromDenomAndBigNumber(currentAsset.denom, reclaimAmount).toActionCoin(
              isReclaimingMaxAmount,
            ),
          ]
        : []

    withdraw({
      accountId: account.id,
      coins,
      borrow,
      reclaims,
    })
    useStore.setState({ fundAndWithdrawModal: null })
  }, [
    account.id,
    amount,
    currentAsset.denom,
    debtAmount,
    isReclaimingMaxAmount,
    max,
    reclaimAmount,
    shouldReclaim,
    withdraw,
  ])

  const onChangeAmount = useCallback(
    (newAmount: BigNumber) => {
      setAmount(newAmount)
      const withdrawAmount = newAmount.isGreaterThan(maxWithdrawAmount)
        ? maxWithdrawAmount
        : newAmount
      const coin = BNCoin.fromDenomAndBigNumber(currentAsset.denom, withdrawAmount.plus(debtAmount))
      simulateWithdraw(withdrawWithBorrowing, coin)
    },
    [currentAsset.denom, debtAmount, maxWithdrawAmount, simulateWithdraw, withdrawWithBorrowing],
  )

  return (
    <>
      <div className='flex flex-wrap w-full'>
        <TokenInputWithSlider
          asset={currentAsset}
          onChange={onChangeAmount}
          onChangeAsset={(asset) => {
            setAmount(BN_ZERO)
            setWithdrawWithBorrowing(false)
            setCurrentAsset(asset)
          }}
          amount={amount}
          max={max}
          className='w-full'
          balances={sortedBalances}
          accountId={account.id}
          hasSelect
          maxText='Max'
          warningMessages={[]}
        />
        <Divider className='my-6' />
        {!isDeprecatedAsset && isBorrowEnabledAsset && (
          <div className='flex flex-wrap w-full'>
            <div className='flex flex-wrap flex-1'>
              <Text className='w-full mb-1'>Withdraw with borrowing</Text>
              <Text size='xs' className='text-white/50'>
                Borrow assets from your Credit Account to withdraw to your wallet
              </Text>
            </div>

            <div className='flex flex-wrap items-center justify-end'>
              <Switch
                name='borrow-to-wallet'
                checked={withdrawWithBorrowing}
                onChange={setWithdrawWithBorrowing}
              />
            </div>
          </div>
        )}
      </div>
      <Button
        onClick={onConfirm}
        disabled={amount.isZero()}
        className='w-full'
        text='Withdraw'
        rightIcon={<ArrowRight />}
      />
    </>
  )
}
