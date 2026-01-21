import BigNumber from 'bignumber.js'
import useSWR from 'swr'

import { BN_ZERO } from 'constants/math'
import { FETCH_TIMEOUT } from 'constants/query'
import useChainConfig from 'hooks/chain/useChainConfig'
import useClients from 'hooks/chain/useClients'
import { ChainInfoID } from 'types/enums'
import { fetchWithTimeout } from 'utils/fetch'
import { BN } from 'utils/helpers'
import iterateContractQuery from 'utils/iterateContractQuery'
import { getUrl } from 'utils/url'

// USDC denom on Neutron - this asset has bad debt that requires special handling
// We query the actual bank balance of the redBank contract instead of using contract state
const NEUTRON_USDC_DENOM = 'ibc/B559A80D62249C8AA07A380E2A2BEA6E5CA9A6F079C912C3A9E9B494105E4F81'

export default function useMarketsInfo() {
  const chainConfig = useChainConfig()
  const clients = useClients()
  return useSWR(
    clients && `chains/${chainConfig.id}/markets/info`,
    () => getMarketsInfo(clients!, chainConfig),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  )
}

async function getRedBankBalance(
  restEndpoint: string,
  redBankAddress: string,
  denom: string,
): Promise<BigNumber> {
  try {
    const uri = getUrl(
      restEndpoint,
      `cosmos/bank/v1beta1/balances/${redBankAddress}/by_denom?denom=${encodeURIComponent(denom)}`,
    )
    const response = await fetchWithTimeout(uri, FETCH_TIMEOUT)
    if (response.ok) {
      const data = await response.json()
      return BN(data.balance?.amount ?? 0)
    }
  } catch (error) {
    console.error('Failed to fetch redBank balance:', error)
  }
  return BN_ZERO
}

async function getMarketsInfo(clients: ContractClients, chainConfig: ChainConfig) {
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

  // For Neutron USDC, fetch the actual bank balance of the redBank contract
  // This is needed because there's bad debt that makes the contract state inaccurate
  let usdcActualBalance: BigNumber | null = null
  if (chainConfig.id === ChainInfoID.Neutron1) {
    usdcActualBalance = await getRedBankBalance(
      chainConfig.endpoints.rest,
      chainConfig.contracts.redBank,
      NEUTRON_USDC_DENOM,
    )
  }

  const [debts, liquidity] = await Promise.all([Promise.all(debts$), Promise.all(liquidities$)])

  return markets.map((market, index) => {
    const deposits = BN(liquidity[index])

    // For USDC on Neutron, use actual bank balance as liquidity and derive debt from it
    if (chainConfig.id === ChainInfoID.Neutron1 && market.denom === NEUTRON_USDC_DENOM && usdcActualBalance !== null) {
      const actualLiquidity = BigNumber.max(usdcActualBalance, BN_ZERO)
      const derivedDebt = BigNumber.max(deposits.minus(actualLiquidity), BN_ZERO)

      return {
        ...market,
        debt: derivedDebt,
        deposits,
        liquidity: actualLiquidity,
      }
    }

    // Default logic for all other markets
    return {
      ...market,
      debt: BN(debts[index]),
      deposits,
      liquidity: BigNumber.max(deposits.minus(debts[index]), BN_ZERO),
    }
  })
}
