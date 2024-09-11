import { BN_ZERO } from 'constants/math'
import DepositsTable from 'earn/lend/Table/DepositedLendsTable'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import useV1DepositsTableData from './Table/useV1DepositsTableData'

export default function Deposits() {
  const { depositAssets } = useV1DepositsTableData()

  if (!depositAssets?.length) {
    return <Fallback />
  }

  return (
    <>
      <DepositsTable data={depositAssets} isLoading={false} v1 />
    </>
  )
}

function Fallback() {
  const assets = useDepositEnabledAssets()

  const data: LendingMarketTableData[] = assets.map((asset) => ({
    asset,
    borrowEnabled: true,
    depositEnabled: true,
    debt: BN_ZERO,
    deposits: BN_ZERO,
    liquidity: BN_ZERO,
    cap: {
      max: BN_ZERO,
      used: BN_ZERO,
      denom: asset.denom,
    },
    apy: {
      borrow: 0,
      deposit: 0,
    },
    ltv: {
      max: 0,
      liq: 0,
    },
  }))

  return <DepositsTable data={data} isLoading v1 />
}
