import { BN_ZERO } from '../../../constants/math'
import useLendEnabledAssets from '../../../hooks/assets/useLendEnabledAssets'
import AvailableLendsTable from './Table/AvailableLendsTable'
import DepositedLendsTable from './Table/DepositedLendsTable'
import useLendingMarketAssetsTableData from './Table/useLendingMarketAssetsTableData'

export default function Lends() {
  const { accountLentAssets, availableAssets, allAssets } = useLendingMarketAssetsTableData()

  if (!allAssets?.length) {
    return <Fallback />
  }
  return (
    <>
      <DepositedLendsTable data={accountLentAssets} isLoading={false} />
      <AvailableLendsTable data={availableAssets} isLoading={false} />
    </>
  )
}

function Fallback() {
  const assets = useLendEnabledAssets()

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

  return <AvailableLendsTable data={data} isLoading />
}
