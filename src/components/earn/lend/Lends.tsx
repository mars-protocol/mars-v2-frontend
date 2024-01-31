import AvailableLendsTable from 'components/earn/lend/Table/AvailableLendsTable'
import DepositedLendsTable from 'components/earn/lend/Table/DepositedLendsTable'
import useLendingMarketAssetsTableData from 'components/earn/lend/Table/useLendingMarketAssetsTableData'
import { BN_ZERO } from 'constants/math'
import useMarketEnabledAssets from 'hooks/assets/useMarketEnabledAssets'

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
  const assets = useMarketEnabledAssets()

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
