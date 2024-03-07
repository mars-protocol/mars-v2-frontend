import BorrowingsTable from 'components/borrow/Table/ActiveBorrowingsTable'
import useV1BorrowingsTableData from 'components/v1/Table/useV1BorrowingsTableData'
import { BN_ZERO } from 'constants/math'
import useBorrowEnabledAssets from 'hooks/assets/useBorrowEnabledAssets'

export default function Borrowings() {
  const { debtAssets } = useV1BorrowingsTableData()

  if (!debtAssets?.length) {
    return <Fallback />
  }

  return (
    <>
      <BorrowingsTable data={debtAssets} isLoading={false} v1 />
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

  return <BorrowingsTable data={data} isLoading v1 />
}
