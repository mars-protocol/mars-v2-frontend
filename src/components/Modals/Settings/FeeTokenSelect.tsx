import { NetworkCurrency } from '@delphi-labs/shuttle'
import AssetImage from 'components/common/assets/AssetImage'
import { FormattedNumber } from 'components/common/FormattedNumber'
import Select from 'components/common/Select'
import Text from 'components/common/Text'
import useAssets from 'hooks/assets/useAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useGasPrices from 'hooks/prices/useGasPrices'
import { getFeeToken, setFeeToken } from 'hooks/wallet/useInitFeeToken'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import { useEffect, useMemo, useState } from 'react'
import useStore from 'store'
import { findBestFeeToken, getAvailableFeeTokens } from 'utils/feeToken'
import { BN } from 'utils/helpers'

export default function FeeTokenSelect() {
  const address = useStore((s) => s.address)
  const { data: walletBalances } = useWalletBalances(address)
  const chainConfig = useChainConfig()
  const { data: assets } = useAssets()
  const { data: gasPricesData } = useGasPrices()
  const feeToken = useMemo(() => getFeeToken(chainConfig.id), [chainConfig.id])
  const [currentFeeToken, setCurrentFeeToken] = useState<NetworkCurrency | undefined>(feeToken)

  useEffect(() => {
    if (!gasPricesData) return
    if (feeToken && walletBalances.length > 0) {
      const currentTokenBalance = walletBalances.find(
        (coin) => coin.denom === feeToken.coinMinimalDenom,
      )

      if (
        (!currentTokenBalance || BN(currentTokenBalance.amount).isLessThanOrEqualTo(0)) &&
        feeToken.coinMinimalDenom !== chainConfig.stables[0]
      ) {
        const bestToken = findBestFeeToken(
          walletBalances,
          gasPricesData.prices,
          chainConfig,
          assets,
        )
        if (bestToken && bestToken.coinMinimalDenom !== feeToken.coinMinimalDenom) {
          setFeeToken(bestToken, chainConfig.id)
        }
      }
    }
  }, [walletBalances, feeToken, gasPricesData, chainConfig, assets])

  useEffect(() => {
    if (!feeToken && gasPricesData) {
      setFeeToken(
        findBestFeeToken(walletBalances, gasPricesData.prices, chainConfig, assets),
        chainConfig.id,
      )
    }
  }, [gasPricesData, feeToken, walletBalances, chainConfig, assets])

  const availableFeeTokens = useMemo(() => {
    if (!gasPricesData?.prices || !chainConfig || !assets) return []
    return getAvailableFeeTokens(walletBalances, gasPricesData.prices, chainConfig, assets)
  }, [assets, chainConfig, gasPricesData, walletBalances])

  const handleSelectToken = (tokenDenom: string) => {
    const token = availableFeeTokens.find(
      (feeToken) => feeToken.token.coinMinimalDenom === tokenDenom,
    )?.token

    if (token && token.coinMinimalDenom !== feeToken?.coinMinimalDenom) {
      setCurrentFeeToken(token)
      setFeeToken(token, chainConfig.id)
    }
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
      defaultValue={currentFeeToken?.coinMinimalDenom || feeToken.coinMinimalDenom}
      onChange={handleSelectToken}
      className='relative border w-60 rounded-base border-white/10'
      containerClassName='justify-end'
    />
  )
}
