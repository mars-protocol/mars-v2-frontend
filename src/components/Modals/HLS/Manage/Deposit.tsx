import BigNumber from 'bignumber.js'
import { useCallback, useMemo } from 'react'

import Button from 'components/common/Button'
import Divider from 'components/common/Divider'
import SummaryItems from 'components/common/SummaryItems'
import Switch from 'components/common/Switch'
import Text from 'components/common/Text'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useAllWhitelistedAssets from 'hooks/assets/useAllWhitelistedAssets'
import useToggle from 'hooks/common/useToggle'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useDepositActions from 'hooks/hls/useDepositActions'
import useMarket from 'hooks/markets/useMarket'
import usePrices from 'hooks/prices/usePrices'
import useCurrentWalletBalance from 'hooks/wallet/useCurrentWalletBalance'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { calculateAccountLeverage } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { getCoinAmount, getCoinValue } from 'utils/formatters'
import { BN } from 'utils/helpers'
import {
  getDepositCapMessage,
  getHealthFactorMessage,
  getLiquidityMessage,
  getNoBalanceInWalletMessage,
} from 'utils/messages'

interface Props {
  account: HLSAccountWithStrategy
  action: HlsStakingManageAction
  borrowMarket: Market
  collateralAsset: Asset
}

export default function Deposit(props: Props) {
  const { addedDeposits, addedDebts, updatedAccount, addedTrades, simulateHlsStakingDeposit } =
    useUpdatedAccount(props.account)
  const { computeMaxBorrowAmount } = useHealthComputer(updatedAccount)

  const assets = useAllWhitelistedAssets()
  const { data: prices } = usePrices()
  const [keepLeverage, toggleKeepLeverage] = useToggle(true)
  const collateralAssetAmountInWallet = BN(
    useCurrentWalletBalance(props.collateralAsset.denom)?.amount || '0',
  )
  const addToStakingStrategy = useStore((s) => s.addToStakingStrategy)
  const borrowRate = useMarket(props.borrowMarket.asset.denom)?.apy.borrow || 0

  const currentLeverage = useMemo(
    () => calculateAccountLeverage(props.account, prices, assets).toNumber(),
    [prices, props.account, assets],
  )

  const depositCoin = useMemo(
    () =>
      BNCoin.fromDenomAndBigNumber(
        props.collateralAsset.denom,
        addedDeposits.find(byDenom(props.collateralAsset.denom))?.amount || BN_ZERO,
      ),
    [addedDeposits, props.collateralAsset.denom],
  )

  const addedDepositFromSwap = useMemo(
    () => addedTrades.find(byDenom(props.collateralAsset.denom))?.amount || BN_ZERO,
    [addedTrades, props.collateralAsset.denom],
  )

  const borrowCoin = useMemo(
    () =>
      BNCoin.fromDenomAndBigNumber(
        props.borrowMarket.asset.denom,
        addedDebts.find(byDenom(props.borrowMarket.asset.denom))?.amount || BN_ZERO,
      ),
    [addedDebts, props.borrowMarket.asset.denom],
  )

  const warningMessages = useMemo(() => {
    let messages: string[] = []
    const capLeft = props.account.strategy.depositCap.max.minus(
      props.account.strategy.depositCap.used,
    )

    if (capLeft.isLessThan(depositCoin.amount.plus(addedDepositFromSwap))) {
      messages.push(getDepositCapMessage(props.collateralAsset.denom, capLeft, 'deposit', assets))
    }

    if (collateralAssetAmountInWallet.isZero()) {
      messages.push(getNoBalanceInWalletMessage(props.collateralAsset.symbol))
    }

    return messages
  }, [
    addedDepositFromSwap,
    collateralAssetAmountInWallet,
    depositCoin.amount,
    props.account.strategy.depositCap.max,
    props.account.strategy.depositCap.used,
    props.collateralAsset.denom,
    props.collateralAsset.symbol,
    assets,
  ])

  const maxBorrowAmount = useMemo(
    () => computeMaxBorrowAmount(props.borrowMarket.asset.denom, 'deposit'),
    [computeMaxBorrowAmount, props.borrowMarket.asset.denom],
  )

  const borrowWarningMessages = useMemo(() => {
    let messages: string[] = []
    if (borrowCoin.amount.isGreaterThan(maxBorrowAmount)) {
      messages.push(
        getHealthFactorMessage(props.borrowMarket.asset.denom, maxBorrowAmount, 'borrow', assets),
      )
    }

    const borrowLiquidity = props.borrowMarket.liquidity || BN_ZERO

    if (borrowCoin.amount.isGreaterThan(borrowLiquidity)) {
      messages.push(getLiquidityMessage(props.borrowMarket.asset.denom, borrowLiquidity, assets))
    }

    return messages
  }, [
    assets,
    borrowCoin.amount,
    maxBorrowAmount,
    props.borrowMarket.asset.denom,
    props.borrowMarket.liquidity,
  ])

  const actions = useDepositActions({ depositCoin, borrowCoin })

  const currentDebt: BigNumber = useMemo(
    () => props.account.debts.find(byDenom(props.borrowMarket.asset.denom))?.amount || BN_ZERO,
    [props.account.debts, props.borrowMarket.asset.denom],
  )

  const handleDeposit = useCallback(() => {
    useStore.setState({ hlsManageModal: null })
    addToStakingStrategy({
      accountId: props.account.id,
      actions,
      depositCoin,
      borrowCoin,
    })
  }, [actions, addToStakingStrategy, borrowCoin, depositCoin, props.account.id])

  const handleOnChange = useCallback(
    (amount: BigNumber) => {
      let additionalDebt = BN_ZERO

      if (currentLeverage > 1 && keepLeverage) {
        const depositValue = getCoinValue(
          BNCoin.fromDenomAndBigNumber(props.collateralAsset.denom, amount),
          prices,
          assets,
        )
        const borrowValue = BN(currentLeverage - 1).times(depositValue)
        additionalDebt = getCoinAmount(props.borrowMarket.asset.denom, borrowValue, prices, assets)
      }

      simulateHlsStakingDeposit(
        BNCoin.fromDenomAndBigNumber(props.collateralAsset.denom, amount),
        BNCoin.fromDenomAndBigNumber(props.borrowMarket.asset.denom, additionalDebt),
      )
    },
    [
      currentLeverage,
      keepLeverage,
      prices,
      props.borrowMarket.asset.denom,
      props.collateralAsset.denom,
      simulateHlsStakingDeposit,
      assets,
    ],
  )

  const items: SummaryItem[] = useMemo(
    () => [
      ...(keepLeverage
        ? [
            {
              title: 'Borrow rate',
              amount: borrowRate,
              options: {
                suffix: `%`,
                minDecimals: 2,
                maxDecimals: 2,
              },
            },
            {
              title: 'Additional Borrow Amount',
              amount: borrowCoin.amount.toNumber(),
              warningMessages: borrowWarningMessages,
              options: {
                suffix: ` ${props.borrowMarket.asset.symbol}`,
                abbreviated: true,
                decimals: props.borrowMarket.asset.decimals,
              },
            },
            {
              title: 'New Debt Amount',
              amount: currentDebt.plus(borrowCoin.amount).toNumber(),
              options: {
                suffix: ` ${props.borrowMarket.asset.symbol}`,
                abbreviated: true,
                decimals: props.borrowMarket.asset.decimals,
              },
            },
          ]
        : []),
    ],
    [
      borrowCoin.amount,
      borrowRate,
      borrowWarningMessages,
      currentDebt,
      keepLeverage,
      props.borrowMarket.asset.decimals,
      props.borrowMarket.asset.symbol,
    ],
  )

  return (
    <>
      <div>
        <TokenInputWithSlider
          amount={depositCoin.amount}
          asset={props.collateralAsset}
          max={collateralAssetAmountInWallet}
          onChange={handleOnChange}
          maxText='In Wallet'
          warningMessages={warningMessages}
        />
        <Divider className='my-6' />
        <div className='flex flex-wrap items-center justify-between flex-1'>
          <div>
            <Text className='w-full mb-1'>Keep leverage</Text>
            <Text size='xs' className='text-white/50'>
              Automatically borrow more funds to keep leverage
            </Text>
          </div>
          <Switch name='keep-leverage' checked={keepLeverage} onChange={toggleKeepLeverage} />
        </div>
      </div>
      <div className='flex flex-col gap-4'>
        <SummaryItems items={items} />
        <Button
          onClick={handleDeposit}
          text='Deposit'
          disabled={
            depositCoin.amount.isZero() ||
            !!warningMessages.length ||
            !!borrowWarningMessages.length
          }
        />
      </div>
    </>
  )
}
