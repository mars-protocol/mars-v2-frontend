import React from 'react'

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
    marketMaxLtv: 0,
    marketDepositAmount: BN_ZERO,
    marketLiquidityRate: 0,
    marketLiquidityAmount: BN_ZERO,
    marketLiquidationThreshold: 0,
  }))

  return <AvailableLendsTable data={data} isLoading />
}
