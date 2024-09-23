import classNames from 'classnames'
import AmountAndValue from 'components/common/AmountAndValue'
import AssetImage from 'components/common/assets/AssetImage'
import { Callout, CalloutType } from 'components/common/Callout'
import { CircularProgress } from 'components/common/CircularProgress'
import Container from 'components/common/Container'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import Text from 'components/common/Text'
import { ExpectedPrice } from 'components/perps/Module/ExpectedPrice'
import TradingFee from 'components/perps/Module/TradingFee'
import { BN_ZERO } from 'constants/math'
import useAccount from 'hooks/accounts/useAccount'
import useAsset from 'hooks/assets/useAsset'
import useMarket from 'hooks/markets/useMarket'
import useTradingFeeAndPrice from 'hooks/perps/useTradingFeeAndPrice'
import useUpdatePerpsPosition from 'hooks/perps/useUpdatePerpsPosition'
import { useMemo } from 'react'
import { BNCoin } from 'types/classes/BNCoin'
import { PnlAmounts } from 'types/generated/mars-perps/MarsPerps.types'
import { byDenom } from 'utils/array'
import { BN, mergeBNCoinArrays } from 'utils/helpers'

interface Props {
  accountId: string
  asset: Asset
  leverage: number
  amount: BigNumber
}

const FEE_LABELS: Record<keyof PnlAmounts, string> = {
  price_pnl: 'Price Change',
  accrued_funding: 'Funding',
  opening_fee: 'Opening Fee',
  closing_fee: 'Closing Fee',
  pnl: 'Total PnL',
}

export default function ConfirmationSummary(props: Props) {
  const { accountId, asset, leverage, amount } = props
  const { data: account } = useAccount(accountId)
  const { data: updatePerpsPosition, isLoading } = useUpdatePerpsPosition(
    asset.denom,
    amount,
    accountId,
  )
  const [newAmount, tradeDirection, isNewPosition, previousAmount] = useMemo(() => {
    if (isLoading || !updatePerpsPosition) return [BN_ZERO, 'long', true, BN_ZERO]
    const positionSize = updatePerpsPosition?.position?.size || '0'
    const previousAmount = BN(positionSize as string)
    const newAmount = previousAmount.plus(amount)
    const isNewPosition = newAmount.isZero()
    const tradeDirection = newAmount.isPositive() ? 'long' : 'short'

    return [newAmount, tradeDirection, isNewPosition, previousAmount]
  }, [amount, isLoading, updatePerpsPosition])

  const { data: tradingFeeAndPrice } = useTradingFeeAndPrice(asset.denom, newAmount, previousAmount)
  const position = useMemo(() => updatePerpsPosition?.position ?? null, [updatePerpsPosition])

  const baseDenom = useMemo(
    () => (position?.base_denom || tradingFeeAndPrice?.baseDenom) ?? 'usd',
    [position, tradingFeeAndPrice],
  )
  const feeAsset = useAsset(baseDenom)
  const feeMarket = useMarket(baseDenom)
  const zeroCoin = useMemo(() => BNCoin.fromDenomAndBigNumber(baseDenom, BN_ZERO), [baseDenom])

  const totalFeeAndPnLCoin = useMemo(() => {
    if (!tradingFeeAndPrice) return zeroCoin
    const tradingFee = tradingFeeAndPrice.fee.closing.plus(tradingFeeAndPrice.fee.opening).negated()
    if (!position) return BNCoin.fromDenomAndBigNumber(baseDenom, tradingFee)

    return BNCoin.fromDenomAndBigNumber(
      baseDenom,
      BN(position.unrealised_pnl.pnl as any).plus(tradingFee),
    )
  }, [baseDenom, position, tradingFeeAndPrice, zeroCoin])

  const [withdrawCoin, borrowCoin] = useMemo(() => {
    if (!account || totalFeeAndPnLCoin.amount.isPositive()) return [zeroCoin, zeroCoin]
    const totalFeeAndPnlToSettle = totalFeeAndPnLCoin.amount.abs()
    const depositsAndLends = mergeBNCoinArrays(account?.deposits, account?.lends)
    const withdrawCoin = depositsAndLends.find(byDenom(baseDenom)) || zeroCoin

    if (withdrawCoin.amount.isGreaterThanOrEqualTo(totalFeeAndPnlToSettle))
      return [BNCoin.fromDenomAndBigNumber(baseDenom, totalFeeAndPnlToSettle), zeroCoin]

    const missingAmount = totalFeeAndPnlToSettle.minus(withdrawCoin.amount)
    return [withdrawCoin, BNCoin.fromDenomAndBigNumber(asset.denom, missingAmount)]
  }, [account, asset.denom, baseDenom, totalFeeAndPnLCoin, zeroCoin])

  if (!amount || !tradeDirection || isLoading || !updatePerpsPosition || !account || !feeMarket)
    return (
      <div className='flex items-center justify-center w-full h-[300px]'>
        <CircularProgress />
      </div>
    )

  let action = 'Open new position'
  if (!isNewPosition) action = 'Update existing position'
  if (newAmount.isZero()) action = 'Close position'
  if (previousAmount.isPositive() && newAmount.isNegative())
    action = 'Flip position from long to short'
  if (previousAmount.isNegative() && newAmount.isPositive())
    action = 'Flip position from short to long'

  let feeLabel = 'Fees'
  if (position && BN(position.unrealised_pnl.pnl as any).isPositive()) feeLabel = 'Fees + Profit'
  if (position && BN(position.unrealised_pnl.pnl as any).isNegative()) feeLabel = 'Fees + Loss'

  return (
    <div className='flex flex-wrap w-full gap-4'>
      <Text className='w-full'>{action}</Text>
      <Container title='New Position' className='w-full'>
        <AssetAmountAndValue asset={asset} amount={newAmount.abs()} />
        {!newAmount.isZero() && (
          <>
            <SummaryRow label='Leverage'>
              <Text size='xs'>{leverage.toFixed(2)}x</Text>
            </SummaryRow>
            <SummaryRow label='Execution Price'>
              <ExpectedPrice
                className='text-xs'
                denom={asset.denom}
                newAmount={newAmount}
                previousAmount={amount}
              />
            </SummaryRow>
          </>
        )}
      </Container>

      <div className='flex flex-wrap w-full'>
        <Text size='xs' className='mt-2 text-white/60' uppercase={true}>
          {feeLabel}
        </Text>
        <SummaryRow label='Trading Fee'>
          <TradingFee
            denom={asset.denom}
            newAmount={newAmount}
            previousAmount={previousAmount}
            className='text-xs'
            showPrefix={true}
          />
        </SummaryRow>
        {position &&
          tradingFeeAndPrice &&
          (Object.keys(position.unrealised_pnl) as Array<keyof PnlAmounts>).map((key, index) => {
            const pnlAmount = BN(position.unrealised_pnl[key] as any)
            const isPnl = key === 'pnl'
            let label = FEE_LABELS[key]
            if (key === 'opening_fee' && !isNewPosition) label = 'Update Fee'
            if (isPnl && pnlAmount.isPositive()) label = 'Total Profit'
            if (isPnl && pnlAmount.isNegative()) label = 'Total Loss'
            if (pnlAmount.isZero()) return null
            return (
              <SummaryRow label={label} key={index} className={classNames(isPnl && 'font-bold')}>
                <DisplayCurrency
                  className={classNames(
                    'text-xs',
                    isPnl && 'font-bold',
                    isPnl && pnlAmount.isPositive() && 'text-profit',
                    isPnl && pnlAmount.isNegative() && 'text-loss',
                  )}
                  coin={BNCoin.fromDenomAndBigNumber(
                    baseDenom,
                    isPnl
                      ? pnlAmount.minus(
                          tradingFeeAndPrice.fee.opening.plus(tradingFeeAndPrice.fee.closing),
                        )
                      : pnlAmount,
                  )}
                  options={{
                    abbreviated: false,
                  }}
                  showSignPrefix={true}
                />
              </SummaryRow>
            )
          })}
      </div>
      {feeAsset && withdrawCoin.amount.isGreaterThan(0) && (
        <Container title='Deposits & Lends to settle' className='w-full mt-2'>
          <AssetAmountAndValue asset={feeAsset} amount={withdrawCoin.amount} />
        </Container>
      )}
      {feeAsset && borrowCoin.amount.isGreaterThan(0) && (
        <Container title='Borrow to settle' className='w-full mt-2'>
          <AssetAmountAndValue asset={feeAsset} amount={borrowCoin.amount} />
        </Container>
      )}
      {feeMarket && feeAsset && borrowCoin.amount.isGreaterThan(feeMarket.liquidity) && (
        <Callout type={CalloutType.WARNING} className='w-full mt-2'>
          <span className='block w-full pb-1'>
            There is not enough {feeAsset.symbol} in the market to borrow.
          </span>
          To execute this trade you need to deposit at least to your Credit Account:
          <FormattedNumber
            amount={borrowCoin.amount.minus(feeMarket.liquidity).toNumber()}
            options={{
              decimals: feeAsset.decimals,
              maxDecimals: feeAsset.decimals,
              suffix: ` ${feeAsset.symbol}`,
            }}
            className='text-xs'
          />
        </Callout>
      )}
    </div>
  )
}

function SummaryRow(props: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className='flex justify-between w-full mt-2'>
      <Text size='xs' className={props.className}>
        {props.label}
      </Text>
      {props.children}
    </div>
  )
}

function AssetAmountAndValue(props: { asset: Asset; amount: BigNumber }) {
  const { asset, amount } = props
  return (
    <div className='flex justify-between flex-1 w-full'>
      <span className='flex items-center gap-2'>
        <AssetImage asset={asset} className='w-8 h-8' />
        <Text size='xs' className='font-bold'>
          {asset.symbol}
        </Text>
      </span>
      <AmountAndValue asset={asset} amount={amount} abbreviated={false} />
    </div>
  )
}
