import { useMemo } from 'react'

import { FormattedNumber } from 'components/common/FormattedNumber'
import Loading from 'components/common/Loading'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import useMarket from 'hooks/markets/useMarket'
import { getLeveragedApy } from 'utils/math'

export const APY_META = { header: 'APY', accessorKey: 'farm.apy' }

interface Props {
  hlsFarm: DepositedHlsFarm
}

export default function Apy(props: Props) {
  const { farm, borrowAsset, leverage } = props.hlsFarm

  const borrowRate = useMarket(borrowAsset.denom)?.apy.borrow

  const leveragedApy = useMemo(() => {
    if (farm.apy === null || !borrowRate) return null
    return getLeveragedApy(farm.apy ?? 0, borrowRate, leverage)
  }, [borrowRate, leverage, farm.apy])

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
