import { BN } from 'utils/helpers'

export function calculatePoolWeight(
  primary: AstroportPoolAsset,
  secondary: AstroportPoolAsset,
): PoolWeight {
  const primaryAmount = BN(primary.amount).shiftedBy(primary.decimals * -1)
  const secondaryAmount = BN(secondary.amount).shiftedBy(secondary.decimals * -1)

  return {
    primaryToSecondary: secondaryAmount.div(primaryAmount).toNumber(),
    secondaryToPrimary: primaryAmount.div(secondaryAmount).toNumber(),
  }
}
