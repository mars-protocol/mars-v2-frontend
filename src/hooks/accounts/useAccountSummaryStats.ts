import useAssets from 'hooks/assets/useAssets'
import useAssetParams from 'hooks/params/useAssetParams'
import useAstroLpAprs from 'hooks/astroLp/useAstroLpAprs'
import useBorrowMarketAssetsTableData from 'components/borrow/Table/useBorrowMarketAssetsTableData'
import useLendingMarketAssetsTableData from 'components/earn/lend/Table/useLendingMarketAssetsTableData'
import usePerpsMarketStates from 'hooks/perps/usePerpsMarketStates'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useVaultAprs from 'hooks/vaults/useVaultAprs'
import { BN } from 'utils/helpers'
import { BN_ZERO } from 'constants/math'
import { getAccountSummaryStats } from 'utils/accounts'
import { useMemo } from 'react'
import { BNCoin } from 'types/classes/BNCoin'
import { ORACLE_DENOM } from 'constants/oracle'

export const useAccountSummaryStats = (account: Account | undefined) => {
  const { data: assets } = useAssets()
  const { data: vaultAprs } = useVaultAprs()
  const { data: perpsVault } = usePerpsVault()
  const astroLpAprs = useAstroLpAprs()
  const assetParams = useAssetParams()
  const perpsMarketStates = usePerpsMarketStates()

  const borrowData = useBorrowMarketAssetsTableData()
  const borrowAssetsData = useMemo(() => borrowData?.allAssets || [], [borrowData])

  const { availableAssets: lendingAvailableAssets, accountLentAssets } =
    useLendingMarketAssetsTableData()

  const lendingAssetsData = useMemo(
    () => [...lendingAvailableAssets, ...accountLentAssets],
    [lendingAvailableAssets, accountLentAssets],
  )

  return useMemo(() => {
    if (!account) {
      return {
        positionValue: BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, BN_ZERO),
        debts: BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, BN_ZERO),
        netWorth: BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, BN_ZERO),
        collateralValue: BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, BN_ZERO),
        apy: BN_ZERO,
        leverage: BN(1),
      }
    }

    return getAccountSummaryStats(
      account,
      borrowAssetsData,
      lendingAssetsData,
      assets,
      vaultAprs,
      astroLpAprs,
      assetParams.data || [],
      perpsVault?.apy || 0,
      perpsMarketStates.data || [],
    )
  }, [
    account,
    borrowAssetsData,
    lendingAssetsData,
    assets,
    vaultAprs,
    astroLpAprs,
    assetParams.data,
    perpsVault?.apy,
    perpsMarketStates.data,
  ])
}
