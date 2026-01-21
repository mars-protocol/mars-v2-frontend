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

  // For Neutron USDC, fetch the actual bank balance AND true total deposits
  // This is needed because there's bad debt that makes the Red Bank's internal state inaccurate
  let usdcActualBalance: BigNumber | null = null
  let usdcTrueDeposits: BigNumber | null = null
  if (chainConfig.id === ChainInfoID.Neutron1) {
    // Fetch actual USDC balance in the redBank contract
    usdcActualBalance = await getRedBankBalance(
      chainConfig.endpoints.rest,
      chainConfig.contracts.redBank,
      NEUTRON_USDC_DENOM,
    )
    // Fetch true total deposits from params contract (not affected by bad debt accounting)
    try {
      const totalDeposit = await clients.params.totalDeposit({ denom: NEUTRON_USDC_DENOM })
      usdcTrueDeposits = BN(totalDeposit.amount)
    } catch (error) {
      console.error('Failed to fetch USDC total deposits:', error)
    }
  }

  const [debts, liquidity] = await Promise.all([Promise.all(debts$), Promise.all(liquidities$)])

  return markets.map((market, index) => {
    const redBankDeposits = BN(liquidity[index])
    const contractDebt = BN(debts[index])

    // For USDC on Neutron, use actual bank balance as liquidity and derive debt from true deposits
    // The Red Bank's internal accounting has been impacted by bad debt, so we use params contract's
    // totalDeposit as the "true" deposits to correctly calculate the borrowed amount
    const isNeutronUsdc = chainConfig.id === ChainInfoID.Neutron1 && market.denom === NEUTRON_USDC_DENOM
    const shouldAdjustForBadDebt = isNeutronUsdc && usdcActualBalance && usdcActualBalance.isGreaterThan(0) && usdcTrueDeposits
    
    if (shouldAdjustForBadDebt) {
      // Use true deposits from params contract for accurate debt calculation
      const trueDeposits = usdcTrueDeposits!
      const actualLiquidity = usdcActualBalance!
      // Derived debt = true deposits - actual balance in contract
      const derivedDebt = BigNumber.max(trueDeposits.minus(actualLiquidity), BN_ZERO)

      return {
        borrow_index: market.borrow_index,
        borrow_rate: market.borrow_rate,
        collateral_total_scaled: market.collateral_total_scaled,
        debt_total_scaled: market.debt_total_scaled,
        denom: market.denom,
        indexes_last_updated: market.indexes_last_updated,
        interest_rate_model: market.interest_rate_model,
        liquidity_index: market.liquidity_index,
        liquidity_rate: market.liquidity_rate,
        reserve_factor: market.reserve_factor,
        debt: derivedDebt,
        deposits: trueDeposits,
        liquidity: actualLiquidity,
      }
    }

    // Default logic for all other markets
    return {
      borrow_index: market.borrow_index,
      borrow_rate: market.borrow_rate,
      collateral_total_scaled: market.collateral_total_scaled,
      debt_total_scaled: market.debt_total_scaled,
      denom: market.denom,
      indexes_last_updated: market.indexes_last_updated,
      interest_rate_model: market.interest_rate_model,
      liquidity_index: market.liquidity_index,
      liquidity_rate: market.liquidity_rate,
      reserve_factor: market.reserve_factor,
      debt: contractDebt,
      deposits: redBankDeposits,
      liquidity: BigNumber.max(redBankDeposits.minus(contractDebt), BN_ZERO),
    }
  })
}
