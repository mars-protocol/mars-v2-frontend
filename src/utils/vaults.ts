import BigNumber from 'bignumber.js'

import { IS_TESTNET } from 'constants/env'
import { TESTNET_VAULTS, VAULTS } from 'constants/vaults'
import { BN } from 'utils/helpers'
import { getNetCollateralValue } from 'utils/accounts'

export function getVaultMetaData(address: string) {
  const vaults = IS_TESTNET ? TESTNET_VAULTS : VAULTS
  return vaults.find((vault) => vault.address === address)
}

// This should be replaced when the calculation is made part of the Health Computer (MP-2877)
export function calculateMaxBorrowAmounts(
  account: Account,
  marketAssets: Market[],
  prices: Coin[],
  denoms: string[],
): Map<string, BigNumber> {
  const maxAmounts = new Map<string, BigNumber>()
  const collateralValue = getNetCollateralValue(account, marketAssets, prices)

  for (const denom of denoms) {
    const borrowAsset = marketAssets.find((asset) => asset.denom === denom)
    const borrowAssetPrice = prices.find((price) => price.denom === denom)?.amount

    if (!borrowAssetPrice || !borrowAsset) continue

    const borrowValue = BN(1).minus(borrowAsset.maxLtv).times(borrowAssetPrice)
    const amount = collateralValue.dividedBy(borrowValue).decimalPlaces(0)

    maxAmounts.set(denom, amount)
  }

  return maxAmounts
}
