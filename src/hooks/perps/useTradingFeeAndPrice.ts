import BigNumber from 'bignumber.js'
import useSWR from 'swr'

import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useChainConfig from 'hooks/useChainConfig'
import useClients from 'hooks/useClients'
import useDebounce from 'hooks/useDebounce'
import { BN } from 'utils/helpers'

import usePerpsConfig from './usePerpsConfig'

export default function useTradingFeeAndPrice(
  denom: string,
  newAmount: BigNumber,
  previousAmount: BigNumber,
) {
  const chainConfig = useChainConfig()
  const accountId = useCurrentAccount()?.id
  const debouncedAmount = useDebounce<BigNumber>(newAmount, 500)
  const clients = useClients()
  const enabled = !debouncedAmount.isEqualTo(previousAmount) && clients && !!accountId
  const { data: perpsConfig } = usePerpsConfig()

  return useSWR(
    enabled && `${chainConfig.id}/perps/${denom}/positionFeeAndPrice/${debouncedAmount}`,
    async () => {
      const isChangingTradeDirection =
        newAmount.isNegative() !== previousAmount.isNegative() && !previousAmount.isZero()

      if (!isChangingTradeDirection) {
        const positionFees = await clients!.perps.positionFees({
          denom,
          newSize: newAmount.toString() as any,
          accountId: accountId!,
        })

        return {
          baseDenom: positionFees.base_denom,
          price: positionFees.opening_exec_price
            ? BN(positionFees.opening_exec_price)
            : BN(positionFees.closing_exec_price ?? BN_ZERO),
          fee: {
            opening: BN(positionFees.opening_fee),
            closing: BN(positionFees.closing_fee),
          },
        }
      }

      // WHen direction is changed, we need to query both the 'closing' fees
      // and also query how the new position would be opened. SC limits flipping trade direction.
      const closingPositionFees$ = clients!.perps.positionFees({
        denom,
        newSize: '0' as any,
        accountId: accountId!,
      })

      const openingPositionFees$ = clients!.perps.positionFees({
        denom,
        newSize: newAmount.toString() as any,
        accountId: '999999999999999', // TODO: Remove this hard-coded value. SC currently does not allow flipping, so providing arbitrary accountId prevents this
      })

      return await Promise.all([closingPositionFees$, openingPositionFees$]).then(
        ([closingPositionFees, openingPositionFees]) => ({
          baseDenom: openingPositionFees.base_denom,
          price: BN(openingPositionFees.opening_exec_price ?? 0),
          fee: {
            opening: BN(closingPositionFees.opening_fee).plus(openingPositionFees.opening_fee),
            closing: BN(closingPositionFees.closing_fee).plus(openingPositionFees.closing_fee),
          },
          rate: perpsConfig ? BN(perpsConfig.closingFee) : BN(0.0005),
        }),
      )
    },
  )
}
