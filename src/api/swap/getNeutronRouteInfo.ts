import { route as skipRoute } from '@skip-go/client'
import getAstroportRouteInfo from 'api/swap/getAstroportRouteInfo'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'

type VenueType = 'duality' | 'astroport' | 'mixed' | 'unknown'

function analyzeVenues(skipRouteResponse: any): VenueType {
  if (!skipRouteResponse) return 'unknown'
  if (!skipRouteResponse.swapVenues && !skipRouteResponse.operations) return 'unknown'

  const venuesUsed = new Set<string>()

  skipRouteResponse.swapVenues?.forEach((venue: any) => {
    if (venue?.name) venuesUsed.add(venue.name)
  })

  skipRouteResponse.operations?.forEach((operation: any) => {
    const venueName = operation?.swap?.swapIn?.swapVenue?.name
    if (venueName) venuesUsed.add(venueName)
  })

  if (venuesUsed.size === 0) return 'unknown'
  if (venuesUsed.size > 1) return 'mixed'

  const singleVenue = Array.from(venuesUsed)[0]
  if (singleVenue === 'neutron-duality') return 'duality'
  if (singleVenue === 'neutron-astroport') return 'astroport'

  return 'unknown'
}

function extractSwapOperations(skipRouteResponse: any): any[] {
  const firstOperation = (skipRouteResponse.operations?.[0] as any)?.swap?.swapIn?.swapOperations
  return firstOperation || []
}

function createDualityRoute(denomIn: string, denomOut: string, swapOperations: any[]): any {
  const swapDenoms: string[] = [denomIn]

  swapOperations.forEach((op: any) => {
    if (op.denomOut && !swapDenoms.includes(op.denomOut)) {
      swapDenoms.push(op.denomOut)
    }
  })

  // Ensure denomOut is included if not already present
  if (!swapDenoms.includes(denomOut)) {
    swapDenoms.push(denomOut)
  }

  return {
    duality: {
      from: denomIn,
      swap_denoms: swapDenoms,
      to: denomOut,
    },
  }
}

function createAstroportRoute(denomIn: string, denomOut: string, swapOperations: any[]): any {
  const swaps: any[] = []

  swapOperations.forEach((op: any) => {
    swaps.push({
      from: op.denomIn,
      to: op.denomOut,
    })
  })

  return {
    astro: {
      swaps: swaps.length > 0 ? swaps : [{ from: denomIn, to: denomOut }],
    },
  }
}

function createSwapDescription(denomIn: string, denomOut: string, assets: Asset[]): string {
  return [
    assets.find(byDenom(denomIn))?.symbol || denomIn,
    assets.find(byDenom(denomOut))?.symbol || denomOut,
  ].join(' -> ')
}

function buildSwapRouteInfo(
  skipRouteResponse: any,
  route: any,
  description: string,
): SwapRouteInfo {
  let priceImpact = BN('0')

  if (skipRouteResponse.swapPriceImpactPercent) {
    priceImpact = BN(skipRouteResponse.swapPriceImpactPercent)
  } else if (skipRouteResponse.usdAmountIn && skipRouteResponse.usdAmountOut) {
    const usdAmountIn = BN(skipRouteResponse.usdAmountIn)
    const usdAmountOut = BN(skipRouteResponse.usdAmountOut)

    if (usdAmountIn.gt(0)) {
      // Price impact = ((usdAmountOut - usdAmountIn) / usdAmountIn) * 100
      priceImpact = usdAmountOut.minus(usdAmountIn).dividedBy(usdAmountIn).multipliedBy(100)
    }
  }

  return {
    amountOut: BN(skipRouteResponse.amountOut || '0'),
    priceImpact,
    fee: BN('0'),
    description,
    route,
  } as SwapRouteInfo
}

export default async function getNeutronRouteInfo(
  denomIn: string,
  denomOut: string,
  amount: BigNumber,
  assets: Asset[],
  chainConfig: ChainConfig,
): Promise<SwapRouteInfo | null> {
  try {
    const skipRouteParams = {
      amountIn: amount.toString(),
      sourceAssetDenom: denomIn,
      sourceAssetChainId: chainConfig.id,
      destAssetDenom: denomOut,
      destAssetChainId: chainConfig.id,
      allowUnsafe: true,
      swapVenues: [
        { name: 'neutron-duality', chainId: chainConfig.id },
        { name: 'neutron-astroport', chainId: chainConfig.id },
      ],
    }

    const skipRouteResponse = await skipRoute(skipRouteParams)

    if (!skipRouteResponse) {
      return await getAstroportRouteInfo(denomIn, denomOut, amount, assets, chainConfig)
    }

    const venueType = analyzeVenues(skipRouteResponse)

    if (venueType === 'mixed' || venueType === 'unknown') {
      return await getAstroportRouteInfo(denomIn, denomOut, amount, assets, chainConfig)
    }

    const swapOperations = extractSwapOperations(skipRouteResponse)

    const route =
      venueType === 'duality'
        ? createDualityRoute(denomIn, denomOut, swapOperations)
        : createAstroportRoute(denomIn, denomOut, swapOperations)

    const description = createSwapDescription(denomIn, denomOut, assets)

    return buildSwapRouteInfo(skipRouteResponse, route, description)
  } catch (error) {
    return await getAstroportRouteInfo(denomIn, denomOut, amount, assets, chainConfig)
  }
}
