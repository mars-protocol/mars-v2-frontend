import { Row } from '@tanstack/react-table'
import { useMemo } from 'react'

import { FormattedNumber } from 'components/common/FormattedNumber'
import Loading from 'components/common/Loading'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import useMarket from 'hooks/markets/useMarket'
import { calculateAccountLeverage } from 'utils/accounts'
import { getLeveragedApy } from 'utils/math'

export const ACTIVE_APY_META = { header: 'APY', accessorKey: 'strategy.apy' }

export const activeApySortingFn = (
  a: Row<HlsAccountWithStrategy>,
  b: Row<HlsAccountWithStrategy>,
): number => {
  // TODO: Properly implement this
  return 0
}

interface Props {
  account: HlsAccountWithStrategy
}

export default function ActiveAPY(props: Props) {
  const assets = useDepositEnabledAssets()
  const borrowRate = useMarket(props.account.strategy.denoms.borrow)?.apy.borrow

  const leverage = useMemo(
    () => calculateAccountLeverage(props.account, assets),
    [assets, props.account],
  )

  const leveragedApy = useMemo(() => {
    if (props.account.strategy.apy === null || !borrowRate) return null
    return getLeveragedApy(props.account.strategy.apy, borrowRate, leverage.toNumber())
  }, [borrowRate, leverage, props.account.strategy.apy])

  if (!leveragedApy) {
    return <Loading />
  }

  return (
    <TitleAndSubCell
      title={<FormattedNumber amount={leveragedApy} options={{ suffix: '%' }} />}
      sub={<FormattedNumber amount={leveragedApy / 365} options={{ suffix: '%/day' }} />}
    />
  )
}
