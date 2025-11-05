import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState } from 'react'

import AccountSummaryInModal from 'components/account/AccountSummary/AccountSummaryInModal'
import AssetImage from 'components/common/assets/AssetImage'
import Button from 'components/common/Button'
import Card from 'components/common/Card'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Divider from 'components/common/Divider'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { ArrowRight } from 'components/common/Icons'
import Text from 'components/common/Text'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import Modal from 'components/Modals/Modal'
import { BN_ZERO } from 'constants/math'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useBaseAsset from 'hooks/assets/useBaseAsset'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { formatPercent } from 'utils/formatters'
import { getDebtAmountWithInterest } from 'utils/tokens'

interface Props {
  account: Account
}

export default function Borrow(props: Props) {
  const { account } = props
  const modal = useStore((s) => s.v1BorrowAndRepayModal)
  const baseAsset = useBaseAsset()
  const [amount, setAmount] = useState(BN_ZERO)
  const v1Action = useStore((s) => s.v1Action)
  const asset = modal?.data.asset ?? baseAsset
  const [max, setMax] = useState(BN_ZERO)
  const { simulateBorrow } = useUpdatedAccount(account)
  const apy = modal?.data.apy.borrow ?? 0
  const { computeMaxBorrowAmount } = useHealthComputer(account)
  const accountDebt = modal?.data.accountDebtAmount ?? BN_ZERO

  const accountDebtWithInterest = useMemo(
    () => getDebtAmountWithInterest(accountDebt, apy),
    [accountDebt, apy],
  )

  const close = useCallback(() => {
    setAmount(BN_ZERO)
    useStore.setState({ v1BorrowAndRepayModal: null })
  }, [setAmount])

  const onConfirmClick = useCallback(() => {
    v1Action('borrow', BNCoin.fromDenomAndBigNumber(asset.denom, amount))
    close()
  }, [v1Action, asset, amount, close])

  const handleChange = useCallback(
    (newAmount: BigNumber) => {
      if (amount.isEqualTo(newAmount)) return
      setAmount(newAmount)
      const borrowCoin = BNCoin.fromDenomAndBigNumber(
        asset.denom,
        newAmount.isGreaterThan(max) ? max : newAmount,
      )
      simulateBorrow('wallet', borrowCoin)
    },
    [amount, asset.denom, max, simulateBorrow],
  )

  const maxBorrow = useMemo(() => {
    const maxBorrowAmount = computeMaxBorrowAmount(asset.denom, 'wallet')

    return BigNumber.min(maxBorrowAmount, modal?.data.liquidity || 0)
  }, [asset.denom, computeMaxBorrowAmount, modal?.data.liquidity])

  useEffect(() => {
    if (maxBorrow.isEqualTo(max)) return
    setMax(maxBorrow)
  }, [account, maxBorrow, max])

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
          <Text>{`Borrow ${asset.symbol} from the Red Bank`}</Text>
        </span>
      }
      headerClassName='gradient-header pl-2 pr-2.5 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col'
    >
      <div className='flex gap-3 px-6 py-4 border-b border-white/5 gradient-header'>
        <TitleAndSubCell title={formatPercent(apy)} sub={'Borrow Rate APY'} />
        {accountDebt.isGreaterThan(0) && (
          <>
            <div className='h-100 w-px bg-surface-light' />
            <div className='flex flex-col gap-0.5'>
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
        <div className='h-100 w-px bg-surface-light' />
        <div className='flex flex-col gap-0.5'>
          <div className='flex gap-2'>
            <FormattedNumber
              className='text-xs'
              amount={modal.data.liquidity.toNumber() ?? 0}
              options={{ decimals: asset.decimals, abbreviated: true, suffix: ` ${asset.symbol}` }}
            />
            <DisplayCurrency
              className='text-xs'
              coin={BNCoin.fromDenomAndBigNumber(asset.denom, modal.data.liquidity ?? BN_ZERO)}
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
          <Button
            onClick={onConfirmClick}
            className='w-full'
            disabled={amount.isZero()}
            text={`Borrow ${asset.symbol}`}
            rightIcon={<ArrowRight />}
          />
        </Card>
        <AccountSummaryInModal account={account} />
      </div>
    </Modal>
  )
}
