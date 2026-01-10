import BigNumber from 'bignumber.js'
import useSWR from 'swr'

import { BN_ZERO } from 'constants/math'
import useChainConfig from 'hooks/chain/useChainConfig'
import useClients from 'hooks/chain/useClients'
import { BN } from 'utils/helpers'
import iterateContractQuery from 'utils/iterateContractQuery'

export default function useMarketsInfo() {
  const chainConfig = useChainConfig()
  const clients = useClients()
  return useSWR(
    clients && `chains/${chainConfig.id}/markets/info`,
    () => getMarketsInfo(clients!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  )
}

async function getMarketsInfo(clients: ContractClients) {
  const markets = await iterateContractQuery(clients.redBank.markets)

  const debts$ = markets.map((market) =>
    clients.redBank.underlyingDebtAmount({
      denom: market.denom,
      amountScaled: market.debt_total_scaled,
    }),
  )

  const liquidities$ = markets.map((market) =>
    clients.redBank.underlyingLiquidityAmount({
      denom: market.denom,
      amountScaled: market.collateral_total_scaled,
    }),
  )

  const [debts, liquidity] = await Promise.all([Promise.all(debts$), Promise.all(liquidities$)])

  return markets.map((market, index) => ({
    ...market,
    debt: BN(debts[index]),
    deposits: BN(liquidity[index]),
    liquidity: BigNumber.max(BN(liquidity[index]).minus(debts[index]), BN_ZERO),
  }))
}
