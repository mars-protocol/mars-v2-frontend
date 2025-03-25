import { NetworkCurrency } from '@delphi-labs/shuttle'
import AssetImage from 'components/common/assets/AssetImage'
import { FormattedNumber } from 'components/common/FormattedNumber'
import Select from 'components/common/Select'
import Text from 'components/common/Text'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import useAssets from 'hooks/assets/useAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useBestFeeToken from 'hooks/prices/useBestFeeToken'
import useGasPrices from 'hooks/prices/useGasPrices'
import { useFeeToken } from 'hooks/wallet/useFeeToken'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import { useCallback, useEffect, useMemo } from 'react'
import useStore from 'store'
import { isFeeBalanceLow } from 'utils/feeToken'
import { BN } from 'utils/helpers'

export default function FeeTokenSelect() {
  const { feeToken, setFeeToken } = useFeeToken()
  const address = useStore((s) => s.address)
  const { data: walletBalances } = useWalletBalances(address)
  const chainConfig = useChainConfig()
  const defaultFeeToken = useBestFeeToken()
  const { data: assets } = useAssets()
  const { data: gasPricesData } = useGasPrices()

  const nativeDenom = chainConfig.defaultCurrency.coinMinimalDenom
  const isLowBalance = isFeeBalanceLow(walletBalances, nativeDenom)

  const nativeBalance = walletBalances.find((coin) => coin.denom === nativeDenom)
  const nativeBalanceAmount = nativeBalance ? BN(nativeBalance.amount) : BN(0)

  const getBestFeeTokenByGasPrice = useCallback(() => {
    if (!gasPricesData || !walletBalances.length) return null

    if (chainConfig.isOsmosis) {
      return {
        coinMinimalDenom: 'uosmo',
        coinDenom: 'OSMO',
        coinDecimals: 6,
      }
    }

    const nativeBalance = walletBalances.find((coin) => coin.denom === nativeDenom)
    const nativeGasPrice = gasPricesData.prices.find((price) => price.denom === nativeDenom)
    const nativeAsset = assets?.find((asset) => asset.denom === nativeDenom)

    if (
      nativeAsset &&
      nativeBalance &&
      BN(nativeBalance.amount).isGreaterThan(0) &&
      nativeGasPrice
    ) {
      return {
        coinMinimalDenom: nativeAsset.denom,
        coinDenom: nativeAsset.symbol,
        coinDecimals: nativeAsset.decimals,
      }
    }

    const usdcDenom = chainConfig.stables[0]
    const usdcBalance = walletBalances.find((coin) => coin.denom === usdcDenom)
    const usdcAsset = assets?.find((asset) => asset.denom === usdcDenom)

    if (usdcBalance && BN(usdcBalance.amount).isGreaterThan(0)) {
      return {
        coinMinimalDenom: usdcDenom,
        coinDenom: 'USDC',
        coinDecimals: usdcAsset?.decimals || 6,
      }
    }

    return null
  }, [
    gasPricesData,
    walletBalances,
    chainConfig.isOsmosis,
    chainConfig.stables,
    assets,
    nativeDenom,
  ])

  useEffect(() => {
    if (feeToken && walletBalances.length > 0) {
      const currentTokenBalance = walletBalances.find(
        (coin) => coin.denom === feeToken.coinMinimalDenom,
      )

      if (!currentTokenBalance || BN(currentTokenBalance.amount).isLessThanOrEqualTo(0)) {
        const bestToken = getBestFeeTokenByGasPrice()
        if (bestToken && bestToken.coinMinimalDenom !== feeToken.coinMinimalDenom) {
          setFeeToken(bestToken)
        }
      }
    }
  }, [walletBalances, feeToken, setFeeToken, getBestFeeTokenByGasPrice])

  useEffect(() => {
    if (!feeToken && gasPricesData) {
      const bestToken = getBestFeeTokenByGasPrice()
      if (bestToken) {
        setFeeToken(bestToken)
      }
    }
  }, [gasPricesData, feeToken, setFeeToken, getBestFeeTokenByGasPrice])

  const availableFeeTokens = useMemo(() => {
    const availableTokens: { token: NetworkCurrency; balance: string; gasPrice?: string }[] = []
    const nativeGasPrice = gasPricesData?.prices.find(
      (price) => price.denom === nativeDenom,
    )?.amount
    const nativeAsset = assets?.find((asset) => asset.denom === nativeDenom)
    if (nativeAsset && nativeBalance && BN(nativeBalance.amount).isGreaterThan(0)) {
      availableTokens.push({
        token: {
          coinDenom: nativeAsset.symbol,
          coinMinimalDenom: nativeAsset.denom,
          coinDecimals: nativeAsset.decimals,
        },
        balance: nativeBalance.amount,
        gasPrice: nativeGasPrice,
      })
    }

    const usdcDenom = chainConfig.stables[0]
    const usdcBalance = walletBalances.find((coin) => coin.denom === usdcDenom)
    const usdcAsset = assets?.find((asset) => asset.denom === usdcDenom)
    if (usdcAsset && usdcBalance && BN(usdcBalance.amount).isGreaterThan(0)) {
      const usdcGasPrice = gasPricesData?.prices.find((price) => price.denom === usdcDenom)?.amount
      availableTokens.push({
        token: {
          coinDenom: 'USDC',
          coinMinimalDenom: usdcDenom,
          coinDecimals: usdcAsset.decimals,
        },
        balance: usdcBalance.amount,
        gasPrice: usdcGasPrice,
      })
    }

    gasPricesData?.prices.forEach((price) => {
      if (price.denom === nativeDenom || price.denom === usdcDenom) return

      const balance = walletBalances.find((coin) => coin.denom === price.denom)
      const asset = assets?.find((a) => a.denom === price.denom)
      if (asset && balance && BN(balance.amount).isGreaterThan(0)) {
        availableTokens.push({
          token: {
            coinDenom: asset.symbol,
            coinMinimalDenom: asset.denom,
            coinDecimals: asset.decimals,
          },
          balance: balance.amount,
          gasPrice: price.amount,
        })
      }
    })

    return availableTokens
      .filter((token) => token.token.coinDecimals === PRICE_ORACLE_DECIMALS)
      .sort((a, b) => (BN(b.balance).isGreaterThan(BN(a.balance)) ? 1 : -1))
  }, [
    assets,
    chainConfig.stables,
    gasPricesData?.prices,
    nativeBalance,
    nativeDenom,
    walletBalances,
  ])

  const handleSelectToken = (tokenDenom: string) => {
    const token = availableFeeTokens.find(
      (feeToken) => feeToken.token.coinMinimalDenom === tokenDenom,
    )?.token

    if (token && token.coinMinimalDenom !== feeToken?.coinMinimalDenom) setFeeToken(token)
  }

  const feeTokenOptions = useMemo(() => {
    const options: SelectOption[] = []
    availableFeeTokens.forEach((feeToken, index) => {
      const asset = assets?.find((a) => a.denom === feeToken.token.coinMinimalDenom)
      if (asset)
        options.push({
          label: (
            <div className='flex w-full items-center gap-2' key={index}>
              <AssetImage asset={asset} className='w-4 h-4' />
              <Text size='sm' className='leading-4'>
                {asset.symbol}
              </Text>
              <FormattedNumber
                className='text-xs text-white/60'
                amount={Number(feeToken.balance)}
                options={{ decimals: asset.decimals, prefix: '(', suffix: ')' }}
              />
            </div>
          ),
          value: asset.denom,
        })
    })
    return options
  }, [assets, availableFeeTokens])

  if (!feeToken) return null
  return (
    <Select
      options={feeTokenOptions}
      defaultValue={feeToken.coinMinimalDenom}
      onChange={handleSelectToken}
      className='relative border w-60 rounded-base border-white/10'
      containerClassName='justify-end'
    />
  )
}
