import AvailableLendsTable from 'components/Earn/Lend/Table/AvailableLendsTable'
import DepositedLendsTable from 'components/Earn/Lend/Table/DepositedLendsTable'
import { BN_ZERO } from 'constants/math'
import useLendingMarketAssetsTableData from 'hooks/useLendingMarketAssetsTableData'
import { getLendEnabledAssets } from 'utils/assets'

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
  const assets = getLendEnabledAssets()
  const data: LendingMarketTableData[] = assets.map((asset) => ({
    asset,
    marketDepositCap: BN_ZERO,
    borrowEnabled: false,
    marketDepositAmount: BN_ZERO,
    marketLiquidityAmount: BN_ZERO,
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
