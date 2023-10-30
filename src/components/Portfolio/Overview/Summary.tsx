import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import SummarySkeleton from 'components/Portfolio/SummarySkeleton'
import { MAX_AMOUNT_DECIMALS } from 'constants/math'
import useAccounts from 'hooks/useAccounts'
import useBorrowMarketAssetsTableData from 'hooks/useBorrowMarketAssetsTableData'
import useLendingMarketAssetsTableData from 'hooks/useLendingMarketAssetsTableData'
import usePrices from 'hooks/usePrices'
import useStore from 'store'
import { getAccountSummaryStats } from 'utils/accounts'
import { DEFAULT_PORTFOLIO_STATS } from 'utils/constants'

export default function PortfolioSummary() {
  const { address: urlAddress } = useParams()
  const walletAddress = useStore((s) => s.address)
  const { data: prices } = usePrices()
  const { data } = useBorrowMarketAssetsTableData(false)
  const borrowAssets = useMemo(() => data?.allAssets || [], [data])
  const { allAssets: lendingAssets } = useLendingMarketAssetsTableData()
  const { data: accounts } = useAccounts('default', urlAddress || walletAddress)

  const stats = useMemo(() => {
    if (!accounts?.length) return
    const combinedAccount = accounts.reduce(
      (combinedAccount, account) => {
        combinedAccount.debts = combinedAccount.debts.concat(account.debts)
        combinedAccount.deposits = combinedAccount.deposits.concat(account.deposits)
        combinedAccount.lends = combinedAccount.lends.concat(account.lends)
        combinedAccount.vaults = combinedAccount.vaults.concat(account.vaults)
        return combinedAccount
      },
      {
        id: '1',
        deposits: [],
        lends: [],
        debts: [],
        vaults: [],
        kind: 'default',
      } as Account,
    )

    const { positionValue, debts, netWorth, apr, leverage } = getAccountSummaryStats(
      combinedAccount,
      prices,
      borrowAssets,
      lendingAssets,
    )

    return [
      {
        title: <DisplayCurrency className='text-xl' coin={positionValue} />,
        sub: DEFAULT_PORTFOLIO_STATS[0].sub,
      },
      {
        title: <DisplayCurrency className='text-xl' coin={debts} />,
        sub: DEFAULT_PORTFOLIO_STATS[1].sub,
      },
      {
        title: <DisplayCurrency className='text-xl' coin={netWorth} />,
        sub: DEFAULT_PORTFOLIO_STATS[2].sub,
      },
      {
        title: (
          <FormattedNumber
            className='text-xl'
            amount={apr.toNumber()}
            options={{
              suffix: '%',
              maxDecimals: apr.abs().isLessThan(0.1) ? MAX_AMOUNT_DECIMALS : 2,
              minDecimals: 2,
            }}
          />
        ),
        sub: 'Combined APR',
      },
      {
        title: (
          <FormattedNumber
            className='text-xl'
            amount={leverage.toNumber()}
            options={{ suffix: 'x' }}
          />
        ),
        sub: 'Combined leverage',
      },
    ]
  }, [accounts, borrowAssets, lendingAssets, prices])

  if (!walletAddress && !urlAddress) return null

  return <SummarySkeleton title='Portfolio Summary' stats={stats} />
}
