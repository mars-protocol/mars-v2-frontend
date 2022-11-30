import BigNumber from 'bignumber.js'

import ContainerSecondary from 'components/ContainerSecondary'
import ArrowRightLine from 'components/Icons/arrow-right-line.svg'
import Text from 'components/Text'
import useAccountStats from 'hooks/useAccountStats'
import useCreditAccountPositions from 'hooks/useCreditAccountPositions'
import useMarkets from 'hooks/useMarkets'
import useTokenPrices from 'hooks/useTokenPrices'
import useCreditManagerStore from 'stores/useCreditManagerStore'
import useWalletStore from 'stores/useWalletStore'
import { chain } from 'utils/chains'
import { formatValue } from 'utils/formatters'
import { getTokenDecimals, getTokenSymbol } from 'utils/tokens'

const CreditManager = () => {
  const address = useWalletStore((s) => s.address)
  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount)
  const toggleCreditManager = useCreditManagerStore((s) => s.actions.toggleCreditManager)

  const { data: positionsData, isLoading: isLoadingPositions } = useCreditAccountPositions(
    selectedAccount ?? '',
  )

  const { data: tokenPrices } = useTokenPrices()
  const { data: marketsData } = useMarkets()
  const accountStats = useAccountStats()

  const getTokenTotalUSDValue = (amount: string, denom: string) => {
    // early return if prices are not fetched yet
    if (!tokenPrices) return 0

    return (
      BigNumber(amount)
        .div(10 ** getTokenDecimals(denom))
        .toNumber() * tokenPrices[denom]
    )
  }

  if (!address) {
    return (
      <div className='absolute inset-0 left-auto w-[400px] border-l border-white/20 bg-grey-medium p-2'>
        <ContainerSecondary>You must have a connected wallet</ContainerSecondary>
      </div>
    )
  }

  return (
    <div className='flex w-[400px] basis-[400px] flex-wrap content-start border-white/20 bg-header placeholder:border-l'>
      <div className='flex w-full flex-wrap items-center border-b border-white/20'>
        <Text size='xl' uppercase={true} className='flex-grow text-center text-white'>
          Account {selectedAccount}
        </Text>
        <div className='flex border-l border-white/20 p-4' onClick={() => {}}>
          <span className='w-5 hover:cursor-pointer' onClick={toggleCreditManager}>
            <ArrowRightLine />
          </span>
        </div>
      </div>
      <div className='flex w-full flex-wrap p-2'>
        <div className='mb-2 flex w-full'>
          <Text size='xs' className='flex-grow text-white/60'>
            Total Position:
          </Text>

          <Text size='xs' className='text-white/60'>
            {formatValue(
              BigNumber(accountStats?.totalPosition ?? 0)
                .dividedBy(10 ** chain.stakeCurrency.coinDecimals)
                .toNumber(),
              2,
              2,
              true,
              '$',
            )}
          </Text>
        </div>
        <div className='flex w-full justify-between'>
          <Text size='xs' className='flex-grow text-white/60'>
            Total Liabilities:
          </Text>
          <Text size='xs' className=' text-white/60'>
            {formatValue(
              BigNumber(accountStats?.totalDebt ?? 0)
                .dividedBy(10 ** chain.stakeCurrency.coinDecimals)
                .toNumber(),
              2,
              2,
              true,
              '$',
            )}
          </Text>
        </div>
      </div>
      <div className='flex w-full flex-wrap'>
        <Text uppercase={true} className='w-full bg-black/20 px-4 py-2 text-white/40'>
          Balances
        </Text>
        {isLoadingPositions ? (
          <div>Loading...</div>
        ) : (
          <div className='flex w-full flex-wrap'>
            <div className='mb-2 flex w-full bg-black/20 px-4 py-2'>
              <Text size='xs' uppercase={true} className='flex-1 text-white'>
                Asset
              </Text>
              <Text size='xs' uppercase={true} className='flex-1 text-white'>
                Value
              </Text>
              <Text size='xs' uppercase={true} className='flex-1 text-white'>
                Size
              </Text>
              <Text size='xs' uppercase={true} className='flex-1 text-white'>
                APY
              </Text>
            </div>
            {positionsData?.coins.map((coin) => (
              <div key={coin.denom} className='flex w-full px-4 py-2'>
                <Text size='xs' className='flex-1 border-l-4 border-profit pl-2 text-white/60'>
                  {getTokenSymbol(coin.denom)}
                </Text>
                <Text size='xs' className='flex-1 text-white/60'>
                  {formatValue(getTokenTotalUSDValue(coin.amount, coin.denom), 2, 2, true, '$')}
                </Text>
                <Text size='xs' className='flex-1 text-white/60'>
                  {formatValue(
                    BigNumber(coin.amount)
                      .div(10 ** getTokenDecimals(coin.denom))
                      .toNumber(),
                    0,
                    4,
                    true,
                  )}
                </Text>
                <Text size='xs' className='flex-1 text-white/60'>
                  -
                </Text>
              </div>
            ))}
            {positionsData?.debts.map((coin) => (
              <div key={coin.denom} className='flex w-full px-4 py-2'>
                <Text size='xs' className='flex-1 border-l-4 border-loss pl-2 text-white/60'>
                  {getTokenSymbol(coin.denom)}
                </Text>
                <Text size='xs' className='flex-1 text-white/60'>
                  {formatValue(getTokenTotalUSDValue(coin.amount, coin.denom), 2, 2, true, '-$')}
                </Text>
                <Text size='xs' className='flex-1 text-white/60'>
                  {formatValue(
                    BigNumber(coin.amount)
                      .div(10 ** getTokenDecimals(coin.denom))
                      .toNumber(),
                    0,
                    4,
                    true,
                  )}
                </Text>
                <Text size='xs' className='flex-1 text-white/60'>
                  -{(Number(marketsData?.[coin.denom].borrow_rate) * 100).toFixed(1)}%
                </Text>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CreditManager
