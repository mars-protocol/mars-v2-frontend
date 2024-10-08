import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import useBorrowMarketAssetsTableData from 'components/borrow/Table/useBorrowMarketAssetsTableData'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import useLendingMarketAssetsTableData from 'components/earn/lend/Table/useLendingMarketAssetsTableData'
import SummarySkeleton from 'components/portfolio/SummarySkeleton'
import { MAX_AMOUNT_DECIMALS } from 'constants/math'
import useAccounts from 'hooks/accounts/useAccounts'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useAstroLpAprs from 'hooks/astroLp/useAstroLpAprs'
import useHlsStakingAssets from 'hooks/hls/useHlsStakingAssets'
import useVaultAprs from 'hooks/vaults/useVaultAprs'
import useStore from 'store'
import { getAccountSummaryStats } from 'utils/accounts'
import { DEFAULT_PORTFOLIO_STATS } from 'utils/constants'

export default function PortfolioSummary() {
  const { address: urlAddress } = useParams()
  const walletAddress = useStore((s) => s.address)
  const data = useBorrowMarketAssetsTableData()
  const borrowAssets = useMemo(() => data?.allAssets || [], [data])
  const { allAssets: lendingAssets } = useLendingMarketAssetsTableData()
  const { data: defaultAccounts } = useAccounts('default', urlAddress || walletAddress)
  const { data: hlsAccounts } = useAccounts('high_levered_strategy', urlAddress || walletAddress)
  const { data: hlsStrategies } = useHlsStakingAssets()
  const { data: vaultAprs } = useVaultAprs()
  const assets = useWhitelistedAssets()
  const astroLpAprs = useAstroLpAprs()

  const allAccounts = useMemo(() => {
    return [...(defaultAccounts || []), ...(hlsAccounts || [])]
  }, [defaultAccounts, hlsAccounts])

  const stats = useMemo(() => {
    if (!allAccounts?.length) return
    const combinedAccount = allAccounts.reduce(
      (combinedAccount, account) => {
        combinedAccount.debts = combinedAccount.debts.concat(account.debts)
        combinedAccount.deposits = combinedAccount.deposits.concat(account.deposits)
        combinedAccount.lends = combinedAccount.lends.concat(account.lends)
        combinedAccount.vaults = combinedAccount.vaults.concat(account.vaults)
        combinedAccount.stakedAstroLps = combinedAccount.stakedAstroLps.concat(
          account.stakedAstroLps,
        )
        return combinedAccount
      },
      {
        id: '1',
        deposits: [],
        lends: [],
        debts: [],
        vaults: [],
        perps: [],
        perpsVault: null,
        stakedAstroLps: [],
        kind: 'default' as AccountKind,
      } as Account,
    )

    const { positionValue, debts, netWorth, apr, leverage } = getAccountSummaryStats(
      combinedAccount,
      borrowAssets,
      lendingAssets,
      hlsStrategies,
      assets,
      vaultAprs,
      astroLpAprs,
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
            amount={isNaN(leverage.toNumber()) ? 1 : leverage.toNumber()}
            options={{ suffix: 'x' }}
          />
        ),
        sub: 'Combined leverage',
      },
    ]
  }, [allAccounts, assets, borrowAssets, hlsStrategies, lendingAssets, vaultAprs, astroLpAprs])

  if (!walletAddress && !urlAddress) return null

  return <SummarySkeleton title='Portfolio Summary' stats={stats} accountId='' />
}
