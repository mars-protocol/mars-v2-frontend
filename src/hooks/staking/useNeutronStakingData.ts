import useSWR from 'swr'
import useStore from 'store'
import { BN } from 'utils/helpers'
import { BN_ZERO } from 'constants/math'
import { convertToNeutronAddress } from 'utils/wallet'
import chains from 'chains'
import useChainConfig from 'hooks/chain/useChainConfig'
import { ChainInfoID } from 'types/enums'

interface ProcessedClaim {
  amount: BigNumber
  releaseTime: Date
  isReady: boolean
}

export interface UnstakedMarsData {
  claims: ProcessedClaim[]
  totalUnstaked: BigNumber
  totalReady: BigNumber
  nextReleaseTime: Date | null
}

const NEUTRON_CONFIG = chains[ChainInfoID.Neutron1]

async function queryNeutronContract(contractAddress: string, queryMsg: any) {
  const queryB64Encoded = Buffer.from(JSON.stringify(queryMsg)).toString('base64')
  const response = await fetch(
    `${NEUTRON_CONFIG.endpoints.rest}/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${queryB64Encoded}`,
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export function useStakedMars() {
  const address = useStore((s) => s.address)
  const neutronAddress = convertToNeutronAddress(address)

  return useSWR(
    neutronAddress ? `neutron-staked-mars/${neutronAddress}` : null,
    async () => {
      try {
        const contractAddress = NEUTRON_CONFIG.contracts.marsVotingPower!
        const data = await queryNeutronContract(contractAddress, {
          voting_power_at_height: { address: neutronAddress },
        })

        const stakedAmountMicro = BN(data.data.power ?? '0')
        const stakedAmount = stakedAmountMicro.shiftedBy(-6)

        return {
          stakedAmount,
          height: data.data.height,
          contractAddress,
        }
      } catch (error) {
        console.error('Failed to fetch staked MARS:', error)
        return {
          stakedAmount: BN_ZERO,
          height: '0',
          contractAddress: '',
        }
      }
    },
    {
      refreshInterval: 30_000,
      revalidateOnFocus: true,
      fallbackData: {
        stakedAmount: BN_ZERO,
        height: '0',
        contractAddress: '',
      },
    },
  )
}

export function useUnstakedMars() {
  const address = useStore((s) => s.address)
  const neutronAddress = convertToNeutronAddress(address)

  const chainConfig = useChainConfig()
  const MARS_DECIMALS = chainConfig.mars?.decimals ?? 0

  return useSWR(
    neutronAddress ? `neutron-unstaked-mars/${neutronAddress}` : null,
    async () => {
      try {
        const contractAddress = NEUTRON_CONFIG.contracts.marsStaking!
        const data = await queryNeutronContract(contractAddress, {
          claims: { address: neutronAddress },
        })

        const now = new Date()
        const processedClaims: ProcessedClaim[] = (data.data.claims ?? []).map((claim: any) => {
          const amount = BN(claim.amount).shiftedBy(-MARS_DECIMALS)
          const releaseTimeMs = BN(claim.release_at.at_time).dividedBy(1_000_000).toNumber()
          const releaseTime = new Date(releaseTimeMs)
          const isReady = releaseTime <= now

          return { amount, releaseTime, isReady }
        })

        const totalUnstaked = processedClaims.reduce(
          (sum: any, claim: any) => sum.plus(claim.amount),
          BN_ZERO,
        )
        const totalReady = processedClaims
          .filter((claim: any) => claim.isReady)
          .reduce((sum: any, claim: any) => sum.plus(claim.amount), BN_ZERO)

        const futureClaims = processedClaims.filter((claim: any) => !claim.isReady)
        const nextReleaseTime =
          futureClaims.length > 0
            ? futureClaims.reduce(
                (earliest: any, claim: any) =>
                  claim.releaseTime < earliest ? claim.releaseTime : earliest,
                futureClaims[0].releaseTime,
              )
            : null

        return {
          claims: processedClaims,
          totalUnstaked,
          totalReady,
          nextReleaseTime,
        }
      } catch (error) {
        console.error('Failed to fetch unstaked MARS claims:', error)
        return {
          claims: [],
          totalUnstaked: BN_ZERO,
          totalReady: BN_ZERO,
          nextReleaseTime: null,
        }
      }
    },
    {
      refreshInterval: 30_000,
      revalidateOnFocus: true,
      fallbackData: {
        claims: [],
        totalUnstaked: BN_ZERO,
        totalReady: BN_ZERO,
        nextReleaseTime: null,
      },
    },
  )
}
