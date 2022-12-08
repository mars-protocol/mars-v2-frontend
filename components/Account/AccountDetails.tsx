import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useEffect, useState } from 'react'

import { AccountManageOverlay, PositionsList, RiskChart } from 'components/Account'
import Button from 'components/Button'
import FormattedNumber from 'components/FormattedNumber'
import ArrowRightLine from 'components/Icons/arrow-right-line.svg'
import ChevronDown from 'components/Icons/chevron-down.svg'
import ChevronLeft from 'components/Icons/chevron-left.svg'
import Text from 'components/Text'
import useAccountStats from 'hooks/useAccountStats'
import useCreditAccountPositions from 'hooks/useCreditAccountPositions'
import useMarkets from 'hooks/useMarkets'
import useTokenPrices from 'hooks/useTokenPrices'
import { useAccountDetailsStore } from 'stores'
import { formatBalances } from 'utils/balances'
import { chain } from 'utils/chains'

const AccountDetails = () => {
  const selectedAccount = useAccountDetailsStore((s) => s.selectedAccount)
  const isOpen = useAccountDetailsStore((s) => s.isOpen)

  const { data: positionsData, isLoading: isLoadingPositions } = useCreditAccountPositions(
    selectedAccount ?? '',
  )

  const accountStats = useAccountStats()
  const { data: marketsData } = useMarkets()
  const { data: tokenPrices } = useTokenPrices()

  const [showManageMenu, setShowManageMenu] = useState(false)
  const [balanceData, setBalanceData] = useState<PositionsData[]>()

  useEffect(() => {
    const balances =
      positionsData?.coins && tokenPrices
        ? formatBalances(positionsData.coins, tokenPrices, false)
        : []
    const debtBalances =
      positionsData?.debts && tokenPrices
        ? formatBalances(positionsData.debts, tokenPrices, true, marketsData)
        : []

    setBalanceData([...balances, ...debtBalances])
  }, [positionsData, isLoadingPositions, marketsData])

  return (
    <div
      className={classNames(
        'relative flex w-[400px] basis-[400px] flex-wrap content-start border-white/20 bg-header',
        'transition-[margin] duration-1000 ease-in-out',
        isOpen ? 'mr-0' : '-mr-[400px]',
      )}
    >
      <Button
        onClick={() => {
          useAccountDetailsStore.setState({ isOpen: true })
        }}
        variant='text'
        className={classNames(
          'absolute top-1/2 -left-[20px] w-[21px] -translate-y-1/2 bg-header p-0',
          'rounded-none rounded-tl-sm rounded-bl-sm',
          'border border-white/20',
          'transition-[opacity] delay-1000 duration-500 ease-in-out',
          isOpen ? 'pointer-events-none opacity-0' : 'opacity-100',
        )}
      >
        <span className='flex h-20 px-1 py-6 text-white/40 transition-[color] hover:text-white'>
          <ChevronLeft />
        </span>
      </Button>
      <div className='relative flex w-full flex-wrap items-center border-b border-white/20'>
        <Button
          variant='text'
          className='flex flex-grow flex-nowrap items-center justify-center p-4 text-center text-white text-xl-caps'
          onClick={() => setShowManageMenu(!showManageMenu)}
        >
          Account {selectedAccount}
          <span className='ml-2 flex w-4'>
            <ChevronDown />
          </span>
        </Button>
        <div className='flex border-l border-white/20' onClick={() => {}}>
          <Button
            variant='text'
            className='w-14 p-4 text-white/40 transition-[color] hover:cursor-pointer  hover:text-white'
            onClick={() => {
              useAccountDetailsStore.setState({ isOpen: false })
            }}
          >
            <ArrowRightLine />
          </Button>
        </div>
        <AccountManageOverlay
          className='top-[60px] left-[36px]'
          show={showManageMenu}
          setShow={setShowManageMenu}
        />
      </div>
      <div className='flex w-full flex-wrap p-3'>
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
      <RiskChart />
      {!isLoadingPositions && balanceData && <PositionsList title='Balances' data={balanceData} />}
    </div>
  )
}

export default AccountDetails
