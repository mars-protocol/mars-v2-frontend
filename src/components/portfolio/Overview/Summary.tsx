import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import SummarySkeleton from 'components/portfolio/SummarySkeleton'
import { MAX_AMOUNT_DECIMALS } from 'constants/math'
import useAccounts from 'hooks/accounts/useAccounts'
import useStore from 'store'
import { DEFAULT_PORTFOLIO_STATS } from 'utils/constants'
import { mergeBNCoinArrays, mergePerpsVaults } from 'utils/helpers'
import { useAccountSummaryStats } from 'hooks/accounts/useAccountSummaryStats'

export default function PortfolioSummary() {
  const { address: urlAddress } = useParams()
  const walletAddress = useStore((s) => s.address)
  const { data: defaultAccounts } = useAccounts('default', urlAddress || walletAddress)
  const { data: hlsAccounts } = useAccounts('high_levered_strategy', urlAddress || walletAddress)

  const allAccounts = useMemo(() => {
    return [...(defaultAccounts || []), ...(hlsAccounts || [])]
  }, [defaultAccounts, hlsAccounts])

  const combinedAccount = useMemo(() => {
    if (!allAccounts?.length) return

    return allAccounts.reduce(
      (combinedAccount, account) => {
        combinedAccount.debts = mergeBNCoinArrays(combinedAccount.debts, account.debts)
        combinedAccount.deposits = mergeBNCoinArrays(combinedAccount.deposits, account.deposits)
        combinedAccount.lends = mergeBNCoinArrays(combinedAccount.lends, account.lends)
        combinedAccount.vaults = combinedAccount.vaults.concat(account.vaults)
        combinedAccount.stakedAstroLps = mergeBNCoinArrays(
          combinedAccount.stakedAstroLps,
          account.stakedAstroLps,
        )
        combinedAccount.perps = combinedAccount.perps.concat(account.perps)
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
  }, [allAccounts])

  const combinedAccountWithPerps = useMemo(() => {
    if (!combinedAccount) return undefined

    const combinedPerpsVaults = mergePerpsVaults(allAccounts.map((account) => account.perpsVault))
    return {
      ...combinedAccount,
      perpsVault: combinedPerpsVaults.denom !== '' ? combinedPerpsVaults : null,
    }
  }, [combinedAccount, allAccounts])

  const { positionValue, collateralValue, debts, netWorth, apy, leverage } =
    useAccountSummaryStats(combinedAccountWithPerps)

  const stats = useMemo(() => {
    if (!combinedAccountWithPerps) return

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
  }, [combinedAccountWithPerps, positionValue, collateralValue, debts, netWorth, apy, leverage])

  if (!walletAddress && !urlAddress) return null

  return <SummarySkeleton title='Portfolio Summary' stats={stats} accountId='' />
}
