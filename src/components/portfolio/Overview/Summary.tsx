import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import useBorrowMarketAssetsTableData from 'components/borrow/Table/useBorrowMarketAssetsTableData'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import useLendingMarketAssetsTableData from 'components/earn/lend/Table/useLendingMarketAssetsTableData'
import SummarySkeleton from 'components/portfolio/SummarySkeleton'
import { MAX_AMOUNT_DECIMALS } from 'constants/math'
import useAccounts from 'hooks/accounts/useAccounts'
import useAssets from 'hooks/assets/useAssets'
import useAstroLpAprs from 'hooks/astroLp/useAstroLpAprs'
import useAssetParams from 'hooks/params/useAssetParams'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useVaultAprs from 'hooks/vaults/useVaultAprs'
import useStore from 'store'
import { getAccountSummaryStats } from 'utils/accounts'
import { DEFAULT_PORTFOLIO_STATS } from 'utils/constants'
import { mergeBNCoinArrays } from 'utils/helpers'

export default function PortfolioSummary() {
  const { address: urlAddress } = useParams()
  const walletAddress = useStore((s) => s.address)
  const data = useBorrowMarketAssetsTableData()
  const borrowAssets = useMemo(() => data?.allAssets || [], [data])
  const { allAssets: lendingAssets } = useLendingMarketAssetsTableData()
  const { data: defaultAccounts } = useAccounts('default', urlAddress || walletAddress)
  const { data: hlsAccounts } = useAccounts('high_levered_strategy', urlAddress || walletAddress)
  const { data: vaultAprs } = useVaultAprs()
  const { data: assets } = useAssets()
  const astroLpAprs = useAstroLpAprs()
  const assetParams = useAssetParams()
  const { data: perpsVault } = usePerpsVault()

  const allAccounts = useMemo(() => {
    return [...(defaultAccounts || []), ...(hlsAccounts || [])]
  }, [defaultAccounts, hlsAccounts])

  const stats = useMemo(() => {
    if (!allAccounts?.length) return
    const combinedAccount = allAccounts.reduce(
      (combinedAccount, account) => {
        combinedAccount.debts = mergeBNCoinArrays(combinedAccount.debts, account.debts)
        combinedAccount.deposits = mergeBNCoinArrays(combinedAccount.deposits, account.deposits)
        combinedAccount.lends = mergeBNCoinArrays(combinedAccount.lends, account.lends)
        combinedAccount.vaults = combinedAccount.vaults.concat(account.vaults)
        combinedAccount.stakedAstroLps = mergeBNCoinArrays(
          combinedAccount.stakedAstroLps,
          account.stakedAstroLps,
        )
        return combinedAccount
      },
      {
        id: 'combined',
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

    const { positionValue, debts, netWorth, collateralValue, apy, leverage } =
      getAccountSummaryStats(
        combinedAccount,
        borrowAssets,
        lendingAssets,
        assets,
        vaultAprs,
        astroLpAprs,
        assetParams.data || [],
        perpsVault?.apy || 0,
      )

    return [
      {
        title: <DisplayCurrency className='text-xl' coin={positionValue} />,
        sub: DEFAULT_PORTFOLIO_STATS[0].sub,
      },
      {
        title: <DisplayCurrency className='text-xl' coin={collateralValue} />,
        sub: DEFAULT_PORTFOLIO_STATS[1].sub,
      },
      {
        title: <DisplayCurrency className='text-xl' coin={debts} />,
        sub: DEFAULT_PORTFOLIO_STATS[2].sub,
      },
      {
        title: <DisplayCurrency className='text-xl' coin={netWorth} />,
        sub: DEFAULT_PORTFOLIO_STATS[3].sub,
      },
      {
        title: (
          <FormattedNumber
            className='text-xl'
            amount={apy.toNumber()}
            options={{
              suffix: '%',
              maxDecimals: apy.abs().isLessThan(0.1) ? MAX_AMOUNT_DECIMALS : 2,
              minDecimals: 2,
            }}
          />
        ),
        sub: 'Combined APY',
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
  }, [
    allAccounts,
    assets,
    borrowAssets,
    lendingAssets,
    vaultAprs,
    astroLpAprs,
    assetParams,
    perpsVault?.apy,
  ])

  if (!walletAddress && !urlAddress) return null

  return <SummarySkeleton title='Portfolio Summary' stats={stats} accountId='' />
}
