import AvailableBorrowingsTable from 'components/Borrow/Table/AvailableBorrowingsTable'
import DepositedBorrowingsTable from 'components/Borrow/Table/DepositedBorrowingsTable'
import { BN_ZERO } from 'constants/math'
import useBorrowMarketAssetsTableData from 'hooks/useBorrowMarketAssetsTableData'
import { getBorrowEnabledAssets } from 'utils/assets'

export default function Borrowings() {
  const { data } = useBorrowMarketAssetsTableData()

  if (!data?.allAssets?.length) {
    return <Fallback />
  }
  return (
    <>
      <DepositedBorrowingsTable data={data.accountBorrowedAssets} isLoading={false} />
      <AvailableBorrowingsTable data={data.availableAssets} isLoading={false} />
    </>
  )
}

function Fallback() {
  const assets = getBorrowEnabledAssets()
  const data: BorrowMarketTableData[] = assets.map((asset) => ({
    asset,
    borrowRate: null,
    liquidity: null,
    marketMaxLtv: 0,
    marketDepositAmount: BN_ZERO,
    marketLiquidityRate: 0,
    marketLiquidityAmount: BN_ZERO,
    marketLiquidationThreshold: 0,
    cap: {
      max: BN_ZERO,
      used: BN_ZERO,
      denom: asset.denom,
    },
  }))

  return <AvailableBorrowingsTable data={data} isLoading />
}
