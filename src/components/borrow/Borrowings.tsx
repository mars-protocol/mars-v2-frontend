import AvailableBorrowingsTable from 'components/borrow/Table/AvailableBorrowingsTable'
import DepositedBorrowingsTable from 'components/borrow/Table/DepositedBorrowingsTable'
import { BN_ZERO } from 'constants/math'
import useBorrowEnabledAssets from 'hooks/assets/useBorrowEnabledAssets'
import useBorrowMarketAssetsTableData from 'hooks/useBorrowMarketAssetsTableData'

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
  const assets = useBorrowEnabledAssets()
  const data: BorrowMarketTableData[] = assets.map((asset) => ({
    asset,
    apy: {
      borrow: 0,
      deposit: 0,
    },
    ltv: {
      max: 0,
      liq: 0,
    },
    liquidity: null,
    marketDepositAmount: BN_ZERO,
    marketLiquidityRate: 0,
    marketLiquidityAmount: BN_ZERO,
  }))

  return <AvailableBorrowingsTable data={data} isLoading />
}
