import DepositedLendsTable from 'components/earn/lend/Table/DepositedLendsTable'
import AvailableLendsTable from 'components/earn/lend/Table/AvailableLendsTable'
import useLendingMarketAssetsTableData from 'components/earn/lend/Table/useLendingMarketAssetsTableData'
import { BN_ZERO } from 'constants/math'
import useLendEnabledAssets from 'hooks/assets/useLendEnabledAssets'

export default function BankLends() {
  const { accountLentAssets, availableAssets, allAssets } = useLendingMarketAssetsTableData()

  if (!allAssets?.length) {
    return <Fallback />
  }

  return (
    <div className='flex flex-col gap-2'>
      <DepositedLendsTable data={accountLentAssets} isLoading={false} />
      <AvailableLendsTable data={availableAssets} isLoading={false} />
    </div>
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

  return (
    <div className='flex flex-col gap-2'>
      <DepositedLendsTable data={[]} isLoading />
      <AvailableLendsTable data={data} isLoading />
    </div>
  )
}
