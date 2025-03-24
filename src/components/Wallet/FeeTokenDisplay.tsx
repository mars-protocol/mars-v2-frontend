import React, { useEffect, useRef } from 'react'
import { useFeeToken } from 'hooks/wallet/useFeeToken'
import Text from 'components/common/Text'
import { Check, ChevronDown, ExclamationMarkTriangle } from 'components/common/Icons'
import classNames from 'classnames'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import useStore from 'store'
import useChainConfig from 'hooks/chain/useChainConfig'
import { BN } from 'utils/helpers'
import { NetworkCurrency } from '@delphi-labs/shuttle'
import { FormattedNumber } from 'components/common/FormattedNumber'
import useBestFeeToken from 'hooks/prices/useBestFeeToken'
import Button from 'components/common/Button'
import Overlay from 'components/common/Overlay'
import useToggle from 'hooks/common/useToggle'
import AssetImage from 'components/common/assets/AssetImage'
import useSWR from 'swr'
import { isNtrnBalanceLow, LOW_NTRN_THRESHOLD } from 'utils/feeToken'
import { LocalStorageKeys } from 'constants/localStorageKeys'

interface FeeTokenDisplayProps {
  className?: string
  isInSettings?: boolean
}

interface GasPrice {
  denom: string
  amount: string
}

interface GasPricesResponse {
  prices: GasPrice[]
}

const FEE_MARKET_API_ROUTE = `${process.env.NEXT_PUBLIC_NEUTRON_REST}/feemarket/v1/gas_prices`

export default function FeeTokenDisplay({ className, isInSettings = false }: FeeTokenDisplayProps) {
  const { feeToken, setFeeToken } = useFeeToken()
  const [showMenu, setShowMenu] = useToggle()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const address = useStore((s) => s?.address) || ''
  const allAssets = useStore((s) => s?.assets) || []
  const { data: walletBalances = [] } = useWalletBalances(address)
  const chainConfig = useChainConfig()
  const defaultFeeToken = useBestFeeToken()

  const settingsModalOpen = useStore((s) => s?.settingsModal) || false

  useEffect(() => {
    if (!settingsModalOpen && isInSettings) {
      setShowMenu(false)
    }
  }, [settingsModalOpen, isInSettings, setShowMenu])

  const { data: gasPricesData } = useSWR<GasPricesResponse>(
    FEE_MARKET_API_ROUTE,
    async (url) => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch gas prices')
      }
      return response.json()
    },
    { refreshInterval: 60000 },
  )

  const nativeDenom = chainConfig.defaultCurrency.coinMinimalDenom
  const isNtrnLow = isNtrnBalanceLow(walletBalances, nativeDenom)

  const nativeBalance = walletBalances.find((coin) => coin.denom === nativeDenom)
  const nativeBalanceAmount = nativeBalance ? BN(nativeBalance.amount) : BN(0)

  const getBestFeeTokenByGasPrice = () => {
    if (!gasPricesData || !walletBalances.length) return null

    const nativeBalance = walletBalances.find((coin) => coin.denom === nativeDenom)
    const nativeGasPrice = gasPricesData.prices.find((price) => price.denom === nativeDenom)

    if (nativeBalance && BN(nativeBalance.amount).isGreaterThan(0) && nativeGasPrice) {
      return {
        coinDenom: nativeDenom === 'untrn' ? 'NTRN' : nativeDenom.toUpperCase(),
        coinMinimalDenom: nativeDenom,
        coinDecimals: nativeDenom === 'untrn' ? 6 : 18,
      }
    }

    const usdcDenom = chainConfig.stables[0]
    const usdcBalance = walletBalances.find((coin) => coin.denom === usdcDenom)

    if (usdcBalance && BN(usdcBalance.amount).isGreaterThan(0)) {
      return {
        coinDenom: 'USDC',
        coinMinimalDenom: usdcDenom,
        coinDecimals: 6,
      }
    }

    return null
  }

  useEffect(() => {
    if (feeToken && walletBalances.length > 0) {
      const currentTokenBalance = walletBalances.find(
        (coin) => coin.denom === feeToken.coinMinimalDenom,
      )

      if (!currentTokenBalance || BN(currentTokenBalance.amount).isLessThanOrEqualTo(0)) {
        const bestToken = getBestFeeTokenByGasPrice()
        if (bestToken) {
          setFeeToken(bestToken)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletBalances, feeToken, setFeeToken])

  useEffect(() => {
    if (!feeToken && gasPricesData) {
      const bestToken = getBestFeeTokenByGasPrice()
      if (bestToken) {
        setFeeToken(bestToken)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gasPricesData, feeToken, setFeeToken])

  const isManuallySelected =
    feeToken && defaultFeeToken && feeToken.coinMinimalDenom !== defaultFeeToken.coinMinimalDenom

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && showMenu) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownRef, showMenu, setShowMenu])

  if (!feeToken) return null

  const availableFeeTokens: { token: NetworkCurrency; balance: string; gasPrice?: string }[] = []

  const nativeGasPrice = gasPricesData?.prices.find((price) => price.denom === nativeDenom)?.amount
  if (nativeBalance && BN(nativeBalance.amount).isGreaterThan(0)) {
    availableFeeTokens.push({
      token: {
        coinDenom: nativeDenom === 'untrn' ? 'NTRN' : nativeDenom.toUpperCase(),
        coinMinimalDenom: nativeDenom,
        coinDecimals: nativeDenom === 'untrn' ? 6 : 18,
      },
      balance: nativeBalance.amount,
      gasPrice: nativeGasPrice,
    })
  }

  const usdcDenom = chainConfig.stables[0]
  const usdcBalance = walletBalances.find((coin) => coin.denom === usdcDenom)
  if (usdcBalance && BN(usdcBalance.amount).isGreaterThan(0)) {
    const usdcGasPrice = gasPricesData?.prices.find((price) => price.denom === usdcDenom)?.amount
    availableFeeTokens.push({
      token: {
        coinDenom: 'USDC',
        coinMinimalDenom: usdcDenom,
        coinDecimals: 6,
      },
      balance: usdcBalance.amount,
      gasPrice: usdcGasPrice,
    })
  }

  const getAssetFromDenom = (denom: string) => {
    return allAssets.find((asset) => asset.denom === denom)
  }

  const handleSelectToken = (token: NetworkCurrency) => {
    setFeeToken(token)
    setShowMenu(false)
  }

  const handleResetToDefault = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(LocalStorageKeys.MARS_FEE_TOKEN)
      } catch (error) {
        console.error('Failed to remove fee token from localStorage:', error)
      }
    }

    const bestToken = getBestFeeTokenByGasPrice()
    if (bestToken) {
      setFeeToken(bestToken)
    } else if (defaultFeeToken) {
      setFeeToken(defaultFeeToken)
    }
    setShowMenu(false)
  }

  if (isInSettings) {
    return (
      <div className={classNames({ relative: true, [className ?? '']: true })}>
        <div ref={dropdownRef} className='relative w-full'>
          <div className='flex justify-between items-center mb-2'>
            <Text className='text-white'>Gas Fee Token</Text>
            {isNtrnLow && feeToken.coinMinimalDenom === nativeDenom && (
              <div className='flex items-center'>
                <ExclamationMarkTriangle className='w-4 h-4 text-warning mr-1' />
                <Text size='xs' className='text-warning'>
                  Low NTRN Balance: {nativeBalanceAmount.shiftedBy(-6).toFormat(4)} NTRN
                </Text>
              </div>
            )}
          </div>

          <div
            onClick={() => setShowMenu()}
            className={classNames(
              'w-full p-3 flex justify-between items-center border rounded cursor-pointer',
              isManuallySelected ? 'border-primary/30 bg-white/5' : 'border-white/20 bg-white/5',
              'hover:border-white/40',
            )}
          >
            <div className='flex items-center'>
              {feeToken && (
                <AssetImage
                  asset={getAssetFromDenom(feeToken.coinMinimalDenom)}
                  className='w-5 h-5 mr-2'
                />
              )}
              <Text>{feeToken.coinDenom}</Text>
            </div>
            <ChevronDown
              className={classNames(
                'w-4 h-4 text-white/50 transition-transform',
                showMenu && 'rotate-180',
              )}
            />
          </div>

          <Text size='xs' className='mt-2 text-white/70'>
            {isManuallySelected
              ? "You've manually selected a fee token. The app will use this token for all transaction fees."
              : availableFeeTokens.length === 1
                ? `Auto-detect has selected ${availableFeeTokens[0].token.coinDenom} for transaction fees since it's the only available token`
                : 'Using auto-detect. The app will prioritize NTRN for transaction fees when available.'}
          </Text>

          <Overlay
            show={showMenu}
            setShow={setShowMenu}
            className='left-0 top-[calc(100%+4px)] w-full absolute z-[60]'
          >
            <div className='bg-gray-950 border border-white/10 rounded overflow-hidden'>
              <div className='p-2 border-b border-white/10'>
                <Text size='xs' className='text-white/70'>
                  Select Fee Token
                </Text>
              </div>
              <div className='max-h-48 overflow-y-auto'>
                {availableFeeTokens.map((item) => (
                  <div
                    key={item.token.coinMinimalDenom}
                    className={classNames(
                      'flex justify-between items-center p-2 hover:bg-white/5 cursor-pointer',
                      feeToken.coinMinimalDenom === item.token.coinMinimalDenom && 'bg-white/10',
                    )}
                    onClick={() => handleSelectToken(item.token)}
                  >
                    <div className='flex items-center'>
                      <AssetImage
                        asset={getAssetFromDenom(item.token.coinMinimalDenom)}
                        className='w-4 h-4 mr-2'
                      />
                      <Text size='xs' className='text-white'>
                        {item.token.coinDenom}
                      </Text>
                      {feeToken.coinMinimalDenom === item.token.coinMinimalDenom && (
                        <Check className='w-3 h-3 text-primary ml-1' />
                      )}
                    </div>
                    <div className='flex flex-col items-end'>
                      <FormattedNumber
                        amount={BN(item.balance).shiftedBy(-item.token.coinDecimals).toNumber()}
                        options={{ maxDecimals: 6 }}
                        className='text-xs text-white/70'
                      />
                      {item.gasPrice && (
                        <Text size='xs' className='text-white/50'>
                          Gas: {parseFloat(item.gasPrice).toFixed(6)}
                        </Text>
                      )}
                    </div>
                  </div>
                ))}
                {isManuallySelected && (
                  <div
                    className='flex justify-between items-center p-2 hover:bg-white/5 cursor-pointer border-t border-white/10'
                    onClick={handleResetToDefault}
                  >
                    <Text size='xs' className='text-white/70'>
                      Reset to Auto-detect
                    </Text>
                  </div>
                )}
                {availableFeeTokens.length === 0 && (
                  <div className='p-2'>
                    <Text size='xs' className='text-white/50'>
                      No tokens available for fees
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </Overlay>
        </div>
      </div>
    )
  }

  return (
    <div ref={dropdownRef} className={classNames('relative', className)}>
      <div className='flex items-center'>
        <Button
          color='secondary'
          size='sm'
          onClick={() => setShowMenu()}
          className={classNames(
            'flex items-center gap-1 !px-2 h-[32px]',
            isManuallySelected && 'border border-primary/30',
          )}
          rightIcon={
            <ChevronDown
              className={classNames(
                'w-3 h-3 text-white/50 transition-transform',
                showMenu && 'rotate-180',
              )}
            />
          }
        >
          <div className='flex items-center'>
            <span className='text-xs text-white/70'>Gas Fee</span>
            <span className='mx-1 text-white/30'>|</span>
            <span className='text-xs'>{feeToken.coinDenom}</span>
            {isNtrnLow && feeToken.coinMinimalDenom === nativeDenom && (
              <ExclamationMarkTriangle className='w-3 h-3 text-warning ml-1' />
            )}
          </div>
        </Button>
      </div>

      <Overlay
        show={showMenu}
        setShow={setShowMenu}
        className='right-0 md:top-8 md:w-[200px] md:mt-2 overflow-hidden top-18 fixed md:absolute w-screen-full md:h-auto'
      >
        <div className='p-2 border-b border-white/10'>
          <Text size='xs' className='text-white/70'>
            Select Fee Token
          </Text>
        </div>
        <div className='max-h-48 overflow-y-auto'>
          {availableFeeTokens.map((item) => (
            <div
              key={item.token.coinMinimalDenom}
              className={classNames(
                'flex justify-between items-center p-2 hover:bg-white/5 cursor-pointer',
                feeToken.coinMinimalDenom === item.token.coinMinimalDenom && 'bg-white/10',
              )}
              onClick={() => handleSelectToken(item.token)}
            >
              <div className='flex items-center'>
                <AssetImage
                  asset={getAssetFromDenom(item.token.coinMinimalDenom)}
                  className='w-4 h-4 mr-2'
                />
                <Text size='xs' className='text-white'>
                  {item.token.coinDenom}
                </Text>
                {feeToken.coinMinimalDenom === item.token.coinMinimalDenom && (
                  <Check className='w-3 h-3 text-primary ml-1' />
                )}
              </div>
              <div className='flex flex-col items-end'>
                <FormattedNumber
                  amount={BN(item.balance).shiftedBy(-item.token.coinDecimals).toNumber()}
                  options={{ maxDecimals: 6 }}
                  className='text-xs text-white/70'
                />
                {item.gasPrice && (
                  <Text size='xs' className='text-white/50'>
                    Gas: {parseFloat(item.gasPrice).toFixed(6)}
                  </Text>
                )}
              </div>
            </div>
          ))}
          {isManuallySelected && (
            <div
              className='flex justify-between items-center p-2 hover:bg-white/5 cursor-pointer border-t border-white/10'
              onClick={handleResetToDefault}
            >
              <Text size='xs' className='text-white/70'>
                Reset to Auto-detect
              </Text>
            </div>
          )}
          {availableFeeTokens.length === 0 && (
            <div className='p-2'>
              <Text size='xs' className='text-white/50'>
                No tokens available for fees
              </Text>
            </div>
          )}
        </div>
      </Overlay>
    </div>
  )
}
