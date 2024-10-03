import BigNumber from 'bignumber.js'
import useSWR from 'swr'

import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useChainConfig from 'hooks/chain/useChainConfig'
import useClients from 'hooks/chain/useClients'
import { BN } from 'utils/helpers'

export default function useTradingFeeAndPrice(denom: string, newAmount: BigNumber) {
  const chainConfig = useChainConfig()
  const accountId = useCurrentAccount()?.id
  const clients = useClients()
  const enabled = clients && !!accountId

  return useSWR(
    enabled && `${chainConfig.id}/perps/${denom}/positionFeeAndPrice/${newAmount}`,
    async () => {
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
    },
    {
      revalidateOnFocus: true,
      refreshInterval: 10_000,
    },
  )
}
