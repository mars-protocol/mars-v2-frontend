import { Row } from '@tanstack/react-table'
import React, { useMemo } from 'react'

import { FormattedNumber } from 'components/FormattedNumber'
import Loading from 'components/Loading'
import TitleAndSubCell from 'components/TitleAndSubCell'
import useBorrowAsset from 'hooks/useBorrowAsset'
import usePrices from 'hooks/usePrices'
import { calculateAccountLeverage } from 'utils/accounts'
import { getLeveragedApy } from 'utils/math'

export const ACTIVE_APY_META = { header: 'APY', accessorKey: 'strategy.apy' }

export const activeApySortingFn = (
  a: Row<HLSAccountWithStrategy>,
  b: Row<HLSAccountWithStrategy>,
): number => {
  // TODO: Properly implement this
  return 0
}

interface Props {
  account: HLSAccountWithStrategy
}

export default function ActiveAPY(props: Props) {
  const { data: prices } = usePrices()
  const borrowRate = useBorrowAsset(props.account.strategy.denoms.borrow)?.borrowRate

  const leverage = useMemo(
    () => calculateAccountLeverage(props.account, prices),
    [prices, props.account],
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
