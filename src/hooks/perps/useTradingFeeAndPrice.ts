import BigNumber from 'bignumber.js'
import useSWR from 'swr'

import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useChainConfig from 'hooks/useChainConfig'
import useClients from 'hooks/useClients'
import useDebounce from 'hooks/useDebounce'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

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
          price: positionFees.opening_exec_price
            ? BN(positionFees.opening_exec_price)
            : BN(positionFees.closing_exec_price ?? BN_ZERO),
          fee: BNCoin.fromDenomAndBigNumber(
            positionFees.base_denom,
            BN(positionFees.opening_fee).plus(positionFees.closing_fee),
          ),
          rate: BN(0.005),
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
        accountId: '91283123987467', // TODO: Remove this hard-coded value. SC currently does not allow flipping, so providing arbitrary accountId prevents this
      })

      return await Promise.all([closingPositionFees$, openingPositionFees$]).then(
        ([closingPositionFees, openingPositionFees]) => ({
          price: BN(openingPositionFees.opening_exec_price ?? 0),
          fee: BNCoin.fromDenomAndBigNumber(
            closingPositionFees.base_denom,
            BN(closingPositionFees.opening_fee)
              .plus(closingPositionFees.closing_fee)
              .plus(openingPositionFees.opening_fee)
              .plus(openingPositionFees.closing_fee),
          ),
          rate: BN(0.005),
        }),
      )
    },
  )
}
