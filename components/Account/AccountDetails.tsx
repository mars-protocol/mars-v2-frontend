import BigNumber from 'bignumber.js'
import classNames from 'classnames'

import Button from 'components/Button'
import FormattedNumber from 'components/FormattedNumber'
import ArrowRightLine from 'components/Icons/arrow-right-line.svg'
import ChevronLeft from 'components/Icons/chevron-left.svg'
import Text from 'components/Text'
import useAccountStats from 'hooks/useAccountStats'
import useCreditAccountPositions from 'hooks/useCreditAccountPositions'
import useMarkets from 'hooks/useMarkets'
import useTokenPrices from 'hooks/useTokenPrices'
import useAccountDetailsStore from 'stores/useAccountDetailsStore'
import { chain } from 'utils/chains'
import { getTokenDecimals, getTokenSymbol } from 'utils/tokens'

const AccountDetails = () => {
  const selectedAccount = useAccountDetailsStore((s) => s.selectedAccount)
  const toggleAccountManager = useAccountDetailsStore((s) => s.actions.toggleAccountManager)
  const isOpen = useAccountDetailsStore((s) => s.isOpen)

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

  return (
    <div
      className={classNames(
        'relative flex w-[400px] basis-[400px] flex-wrap content-start border-white/20 bg-header placeholder:border-l',
        'transition-[margin] duration-1000 ease-in-out',
        isOpen ? 'mr-0' : '-mr-[400px]',
      )}
    >
      <Button
        onClick={!isOpen ? toggleAccountManager : () => false}
        variant='text'
        className={classNames(
          'absolute top-1/2 -left-[22px] -translate-y-1/2 bg-header px-1 py-6',
          'text-white/40 hover:text-white',
          'rounded-none rounded-tl-sm rounded-bl-sm',
          'border border-white/20',
          'transition-[opacity] delay-1000 duration-500 ease-in-out',
          isOpen ? 'pointer-events-none opacity-0' : 'opacity-100',
        )}
      >
        <span className='flex h-5'>
          <ChevronLeft />
        </span>
      </Button>
      <div className='flex w-full flex-wrap items-center border-b border-white/20'>
        <Text size='xl' uppercase className='flex-grow text-center text-white'>
          Account {selectedAccount}
        </Text>
        <div className='flex border-l border-white/20 p-4' onClick={() => {}}>
          <span className='w-5 hover:cursor-pointer' onClick={toggleAccountManager}>
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
            <FormattedNumber
              amount={BigNumber(accountStats?.totalPosition ?? 0)
                .dividedBy(10 ** chain.stakeCurrency.coinDecimals)
                .toNumber()}
              animate
              prefix='$'
            />
          </Text>
        </div>
        <div className='flex w-full justify-between'>
          <Text size='xs' className='flex-grow text-white/60'>
            Total Liabilities:
          </Text>
          <Text size='xs' className=' text-white/60'>
            <FormattedNumber
              amount={BigNumber(accountStats?.totalDebt ?? 0)
                .dividedBy(10 ** chain.stakeCurrency.coinDecimals)
                .toNumber()}
              animate
              prefix='$'
            />
          </Text>
        </div>
      </div>
      <div className='flex w-full flex-wrap'>
        <Text uppercase className='w-full bg-black/20 px-4 py-2 text-white/40'>
          Balances
        </Text>
        {isLoadingPositions ? (
          <div>Loading...</div>
        ) : (
          <div className='flex w-full flex-wrap'>
            <div className='mb-2 flex w-full border-b border-white/20 bg-black/20 px-4 py-2'>
              <Text size='xs' uppercase className='flex-1 text-white'>
                Asset
              </Text>
              <Text size='xs' uppercase className='flex-1 text-white'>
                Value
              </Text>
              <Text size='xs' uppercase className='flex-1 text-white'>
                Size
              </Text>
              <Text size='xs' uppercase className='flex-1 text-white'>
                APY
              </Text>
            </div>
            {positionsData?.coins.map((coin) => (
              <div key={coin.denom} className='flex w-full px-4 py-2'>
                <Text size='xs' className='flex-1 border-l-4 border-profit pl-2 text-white/60'>
                  {getTokenSymbol(coin.denom)}
                </Text>
                <Text size='xs' className='flex-1 text-white/60'>
                  <FormattedNumber
                    amount={getTokenTotalUSDValue(coin.amount, coin.denom)}
                    animate
                    prefix='$'
                  />
                </Text>
                <Text size='xs' className='flex-1 text-white/60'>
                  <FormattedNumber
                    amount={BigNumber(coin.amount)
                      .div(10 ** getTokenDecimals(coin.denom))
                      .toNumber()}
                    animate
                    minDecimals={0}
                    maxDecimals={4}
                  />
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
                  <FormattedNumber
                    amount={getTokenTotalUSDValue(coin.amount, coin.denom)}
                    prefix='-$'
                    animate
                  />
                </Text>
                <Text size='xs' className='flex-1 text-white/60'>
                  <FormattedNumber
                    amount={BigNumber(coin.amount)
                      .div(10 ** getTokenDecimals(coin.denom))
                      .toNumber()}
                    minDecimals={0}
                    maxDecimals={4}
                    animate
                  />
                </Text>
                <Text size='xs' className='flex-1 text-white/60'>
                  <FormattedNumber
                    amount={Number(marketsData?.[coin.denom].borrow_rate) * 100}
                    minDecimals={0}
                    maxDecimals={2}
                    prefix='-'
                    suffix='%'
                    animate
                  />
                </Text>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountDetails
