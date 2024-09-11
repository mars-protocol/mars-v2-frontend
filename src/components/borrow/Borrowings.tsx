import { BN_ZERO } from 'constants/math'
import useBorrowEnabledAssets from 'hooks/assets/useBorrowEnabledAssets'
import ActiveBorrowingsTable from './Table/ActiveBorrowingsTable'
import AvailableBorrowingsTable from './Table/AvailableBorrowingsTable'
import useBorrowMarketAssetsTableData from './Table/useBorrowMarketAssetsTableData'

export default function Borrowings() {
  const { accountBorrowedAssets, availableAssets, allAssets } = useBorrowMarketAssetsTableData()

  if (!allAssets?.length) {
    return <Fallback />
  }
  return (
    <>
      <ActiveBorrowingsTable data={accountBorrowedAssets} isLoading={false} />
      <AvailableBorrowingsTable data={availableAssets} isLoading={false} />
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
    liquidity: BN_ZERO,
    marketLiquidityRate: 0,
    cap: {
      denom: asset.denom,
      max: BN_ZERO,
      used: BN_ZERO,
    },
    debt: BN_ZERO,
    borrowEnabled: true,
    depositEnabled: true,
    deposits: BN_ZERO,
    accountDebt: BN_ZERO,
  }))

  return <AvailableBorrowingsTable data={data} isLoading />
}
