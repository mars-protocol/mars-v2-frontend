import { useMemo } from 'react'

import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import StatsCardsSkeleton from 'components/Stats/StatsCardsSkeleton'
import { ORACLE_DENOM } from 'constants/oracle'
import { BNCoin } from 'types/classes/BNCoin'
import { DEFAULT_ADDITIONAL_STATS } from 'utils/constants'

export default function StatsAdditional() {
  const stats = useMemo(() => {
    const totalTvl = new BNCoin({ denom: ORACLE_DENOM, amount: '121345123.67' })
    const totalAccounts = 52134
    const totalFees = new BNCoin({ denom: ORACLE_DENOM, amount: '321230.34' })
    return [
      {
        head: DEFAULT_ADDITIONAL_STATS[0].head,
        title: <DisplayCurrency className='text-xl' coin={totalTvl} abbreviated={false} />,
        sub: DEFAULT_ADDITIONAL_STATS[0].sub,
      },
      {
        head: DEFAULT_ADDITIONAL_STATS[1].head,
        title: (
          <FormattedNumber
            className='text-xl'
            amount={totalAccounts}
            options={{ maxDecimals: 0, minDecimals: 0, abbreviated: false }}
          />
        ),
        sub: DEFAULT_ADDITIONAL_STATS[1].sub,
      },
      {
        head: DEFAULT_ADDITIONAL_STATS[2].head,
        title: <DisplayCurrency className='text-xl' coin={totalFees} abbreviated={false} />,
        sub: DEFAULT_ADDITIONAL_STATS[2].sub,
      },
    ]
  }, [])

  return <StatsCardsSkeleton stats={stats} />
}
