import classNames from 'classnames'
import LiqPrice from 'components/account/AccountBalancesTable/Columns/LiqPrice'
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
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useMarket from 'hooks/markets/useMarket'
import useTradingFeeAndPrice from 'hooks/perps/useTradingFeeAndPrice'
import useUpdatePerpsPosition from 'hooks/perps/useUpdatePerpsPosition'
import { useMemo } from 'react'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { PnlAmounts } from 'types/generated/mars-perps/MarsPerps.types'
import { byDenom } from 'utils/array'
import { BN, mergeBNCoinArrays } from 'utils/helpers'

interface Props {
  accountId: string
  asset: Asset
  leverage: number
  amount: BigNumber
  limitPrice?: BigNumber
  keeperFee?: BNCoin
}

const FEE_LABELS: Record<keyof PnlAmounts, string> = {
  price_pnl: 'Price Change',
  accrued_funding: 'Funding',
  opening_fee: 'Opening Fee',
  closing_fee: 'Closing Fee',
  pnl: 'Total PnL',
}

function getActionLabel(prevAmount: BigNumber, newAmount: BigNumber): string {
  if (prevAmount.isZero()) return 'Open new position'
  if (newAmount.isZero()) return 'Close position'
  if (prevAmount.isPositive() && newAmount.isNegative()) return 'Flip position from long to short'
  if (prevAmount.isNegative() && newAmount.isPositive()) return 'Flip position from short to long'

  return 'Update existing position'
}

function getFeeLabel(unrealizedPnL: BigNumber, limitPrice?: BigNumber): string {
  if (unrealizedPnL.isZero() || limitPrice) return 'Fees'
  if (unrealizedPnL.isPositive()) return 'Fees + Profit'
  if (unrealizedPnL.isNegative()) return 'Fees + Loss'
  return 'Fees'
}

function getFeeBreakdownLabel(
  key: keyof PnlAmounts,
  pnlAmount: BigNumber,
  isNewPosition: boolean,
  isFlipping: boolean,
  newAmount: BigNumber,
  limitPrice?: BigNumber,
): string {
  const isPnl = key === 'pnl'
  let label = FEE_LABELS[key]
  if (key === 'opening_fee' && !isNewPosition && !isFlipping) label = 'Update Fee'
  if (key === 'closing_fee' && !isFlipping && !newAmount.isZero()) label = 'Update Fee'
  if (isPnl && pnlAmount.isPositive()) label = 'Total Profit'
  if (isPnl && pnlAmount.isNegative()) label = 'Total Loss'
  if (isPnl && limitPrice) label = 'Total Fees'
  return label
}

export default function ConfirmationSummary(props: Props) {
  const { accountId, asset, leverage, amount, keeperFee, limitPrice } = props
  const { data: account } = useAccount(accountId)
  const updatedAccount = useStore((s) => s.updatedAccount)
  const { data: updatePerpsPosition, isLoading } = useUpdatePerpsPosition(
    asset.denom,
    amount,
    accountId,
  )
  const [newAmount, tradeDirection, isNewPosition, previousAmount, isFlipping] = useMemo(() => {
    if (isLoading || !updatePerpsPosition) return [BN_ZERO, 'long', true, BN_ZERO, false]
    const positionSize = updatePerpsPosition?.position?.size || '0'
    const previousAmount = BN(positionSize as string)
    const newAmount = previousAmount.plus(amount)
    const isNewPosition = previousAmount.isZero()
    const previousTradeDirection = previousAmount.isPositive() ? 'long' : 'short'
    const newDirection = newAmount.isPositive() ? 'long' : 'short'
    const tradeDirection = newAmount.isZero() ? previousTradeDirection : newDirection
    const isFlipping = previousTradeDirection !== tradeDirection

    return [newAmount, tradeDirection, isNewPosition, previousAmount, isFlipping]
  }, [amount, isLoading, updatePerpsPosition])

  const { computeLiquidationPrice } = useHealthComputer(updatedAccount ?? account)
  const { data: tradingFeeAndPrice } = useTradingFeeAndPrice(asset.denom, newAmount)
  const position = useMemo(() => updatePerpsPosition?.position ?? null, [updatePerpsPosition])

  const baseDenom = useMemo(
    () => (position?.base_denom || tradingFeeAndPrice?.baseDenom) ?? 'usd',
    [position, tradingFeeAndPrice],
  )
  const feeAsset = useAsset(baseDenom)
  const feeMarket = useMarket(baseDenom)
  const zeroCoin = useMemo(() => BNCoin.fromDenomAndBigNumber(baseDenom, BN_ZERO), [baseDenom])

  const totalFeeAndPnLCoin = useMemo(() => {
    let tradingFee = BN_ZERO
    if (!tradingFeeAndPrice && !keeperFee) return zeroCoin
    if (tradingFeeAndPrice)
      tradingFee = tradingFee
        .plus(tradingFeeAndPrice.fee.closing)
        .plus(tradingFeeAndPrice.fee.opening)
    tradingFee = tradingFee.negated()
    if (position && limitPrice)
      tradingFee = BN(position.unrealized_pnl.pnl as any)
        .minus(position.unrealized_pnl.price_pnl as any)
        .minus(position.unrealized_pnl.accrued_funding as any)
    if (position && !limitPrice)
      tradingFee = BN(position.unrealized_pnl.pnl as any)
        .minus(tradingFeeAndPrice?.fee.closing ?? BN_ZERO)
        .minus(tradingFeeAndPrice?.fee.opening ?? BN_ZERO)
    if (keeperFee) tradingFee = tradingFee.minus(keeperFee.amount)
    return BNCoin.fromDenomAndBigNumber(baseDenom, tradingFee)
  }, [baseDenom, keeperFee, limitPrice, position, tradingFeeAndPrice, zeroCoin])

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

  const action = getActionLabel(previousAmount, newAmount)
  const feeLabel = getFeeLabel(BN((position?.unrealized_pnl.pnl as any) ?? 0), limitPrice)

  return (
    <div className='flex flex-wrap w-full gap-4'>
      <Text className='w-full'>{action}</Text>
      <Container title='New Position' className='w-full'>
        <AssetAmountAndValue asset={asset} amount={newAmount.abs()} priceOverride={limitPrice} />
        {!newAmount.isZero() && (
          <>
            <SummaryRow label='Leverage'>
              <Text size='xs'>{leverage.toFixed(2)}x</Text>
            </SummaryRow>
            <SummaryRow label='Execution Price'>
              <ExpectedPrice
                tradeDirection={tradeDirection as TradeDirection}
                className='text-xs'
                denom={asset.denom}
                newAmount={newAmount}
                override={limitPrice}
              />
            </SummaryRow>
            {!limitPrice && (
              <SummaryRow label='Liquidation Price'>
                <LiqPrice
                  denom={asset.denom}
                  computeLiquidationPrice={computeLiquidationPrice}
                  type='perp'
                  amount={newAmount.toNumber()}
                  account={updatedAccount ?? account}
                  isWhitelisted={true}
                />
              </SummaryRow>
            )}
          </>
        )}
      </Container>

      <div className='flex flex-wrap w-full'>
        <Text size='xs' className='mt-2 text-white/60' uppercase={true}>
          {feeLabel}
        </Text>
        {!position && (
          <SummaryRow label='Trading Fee'>
            <TradingFee
              denom={asset.denom}
              newAmount={newAmount}
              previousAmount={previousAmount}
              className='text-xs'
              showPrefix={true}
            />
          </SummaryRow>
        )}
        {keeperFee && (
          <SummaryRow label='Keeper Fee'>
            <DisplayCurrency
              className='text-xs'
              coin={BNCoin.fromDenomAndBigNumber(keeperFee.denom, keeperFee.amount.negated())}
              options={{
                abbreviated: false,
              }}
              showSignPrefix={true}
            />
          </SummaryRow>
        )}
        {position &&
          tradingFeeAndPrice &&
          (Object.keys(position.unrealized_pnl) as Array<keyof PnlAmounts>).map((key, index) => {
            const isPnl = key === 'pnl'
            const pnlAmount =
              isPnl && limitPrice
                ? totalFeeAndPnLCoin.amount
                : BN(position.unrealized_pnl[key] as any)

            if (
              ((key === 'price_pnl' || key === 'accrued_funding') && limitPrice) ||
              pnlAmount.isZero()
            )
              return null

            const label = getFeeBreakdownLabel(
              key,
              pnlAmount,
              isNewPosition,
              isFlipping,
              newAmount,
              limitPrice,
            )
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
                    isPnl && !limitPrice
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

function AssetAmountAndValue(props: {
  asset: Asset
  amount: BigNumber
  priceOverride?: BigNumber
}) {
  const { asset, amount, priceOverride } = props
  return (
    <div className='flex justify-between flex-1 w-full'>
      <span className='flex items-center gap-2'>
        <AssetImage asset={asset} className='w-8 h-8' />
        <Text size='xs' className='font-bold'>
          {asset.symbol}
        </Text>
      </span>
      <AmountAndValue
        asset={asset}
        amount={amount}
        abbreviated={false}
        priceOverride={priceOverride}
      />
    </div>
  )
}
