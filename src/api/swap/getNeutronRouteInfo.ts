import BigNumber from 'bignumber.js'

import { route as skipRoute } from '@skip-go/client'
import getAstroportRouteInfo from 'api/swap/getAstroportRouteInfo'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { byDenom } from 'utils/array'
import { BN, toIntegerString } from 'utils/helpers'

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
  isReverse: boolean = false,
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

  const routeInfo: SwapRouteInfo = {
    amountOut: BN(skipRouteResponse.amountOut || '0'),
    priceImpact,
    fee: BN('0'),
    description,
    route,
  }

  // Note: Reverse routing is now handled separately using iterative forward routing

  return routeInfo
}

/**
 * Shared internal function for both normal and reverse routing
 */
async function getNeutronRouteInfoInternal(
  denomIn: string,
  denomOut: string,
  assets: Asset[],
  chainConfig: ChainConfig,
  routeParams: any,
  isReverse: boolean = false,
  shouldFallbackToAstroport: boolean = true,
): Promise<SwapRouteInfo | null> {
  try {
    const skipRouteParams = {
      sourceAssetDenom: denomIn,
      sourceAssetChainId: chainConfig.id,
      destAssetDenom: denomOut,
      destAssetChainId: chainConfig.id,
      allowUnsafe: true,
      swapVenues: [
        { name: 'neutron-duality', chainId: chainConfig.id },
        { name: 'neutron-astroport', chainId: chainConfig.id },
      ],
      ...routeParams,
    }

    const skipRouteResponse = await skipRoute(skipRouteParams)

    if (!skipRouteResponse) {
      if (shouldFallbackToAstroport && !isReverse) {
        return await getAstroportRouteInfo(
          denomIn,
          denomOut,
          routeParams.amountIn,
          assets,
          chainConfig,
        )
      }
      return null
    }

    const venueType = analyzeVenues(skipRouteResponse)

    if (venueType === 'mixed' || venueType === 'unknown') {
      if (shouldFallbackToAstroport && !isReverse) {
        return await getAstroportRouteInfo(
          denomIn,
          denomOut,
          routeParams.amountIn,
          assets,
          chainConfig,
        )
      }
      return null
    }

    const swapOperations = extractSwapOperations(skipRouteResponse)

    const route =
      venueType === 'duality'
        ? createDualityRoute(denomIn, denomOut, swapOperations)
        : createAstroportRoute(denomIn, denomOut, swapOperations)

    const description = createSwapDescription(denomIn, denomOut, assets)

    const routeInfo = buildSwapRouteInfo(skipRouteResponse, route, description, isReverse)

    return routeInfo
  } catch (error) {
    if (shouldFallbackToAstroport && !isReverse) {
      return await getAstroportRouteInfo(
        denomIn,
        denomOut,
        routeParams.amountIn,
        assets,
        chainConfig,
      )
    }
    return null
  }
}

/**
 * Reverse routing function that uses minAmountOut instead of amountIn
 * Specifically designed for HLS debt repayment scenarios where we need
 * to know how much collateral to swap to get an exact debt amount
 */
/**
 * Implements reverse routing using Skip API's native reverse swap support
 * Uses the swapOut operation to specify exact output amount needed
 */
export async function getNeutronRouteInfoReverse(
  denomIn: string,
  denomOut: string,
  amountOut: BigNumber,
  assets: Asset[],
  chainConfig: ChainConfig,
  slippage?: number, // Will use default from settings if not provided
): Promise<SwapRouteInfo | null> {
  // Use default slippage from settings if not provided
  const effectiveSlippage = slippage ?? getDefaultChainSettings(chainConfig).slippage

  try {
    const skipRouteParams = {
      sourceAssetDenom: denomIn,
      sourceAssetChainId: chainConfig.id,
      destAssetDenom: denomOut,
      destAssetChainId: chainConfig.id,
      allowUnsafe: true,
      swapVenues: [
        { name: 'neutron-duality', chainId: chainConfig.id },
        { name: 'neutron-astroport', chainId: chainConfig.id },
      ],
      // Use reverse routing parameters
      amountOut: toIntegerString(amountOut),
    }

    const skipRouteResponse = await skipRoute(skipRouteParams)

    if (!skipRouteResponse) {
      return null
    }

    const venueType = analyzeVenues(skipRouteResponse)

    if (venueType === 'mixed' || venueType === 'unknown') {
      return null
    }

    const swapOperations = extractSwapOperations(skipRouteResponse)

    const route =
      venueType === 'duality'
        ? createDualityRoute(denomIn, denomOut, swapOperations)
        : createAstroportRoute(denomIn, denomOut, swapOperations)

    const description = createSwapDescription(denomIn, denomOut, assets)

    const routeInfo = buildSwapRouteInfo(skipRouteResponse, route, description, false)

    // For reverse routing, add the amountIn that Skip calculated
    if (skipRouteResponse.amountIn) {
      ;(routeInfo as any).amountIn = BN(skipRouteResponse.amountIn)
    } else {
      ;(routeInfo as any).amountIn = null
    }

    // Ensure amountOut matches what we requested
    routeInfo.amountOut = amountOut

    return routeInfo
  } catch (error) {
    // Fallback to binary search if native reverse routing fails
    return await binarySearchReverseRouting(
      denomIn,
      denomOut,
      amountOut,
      assets,
      chainConfig,
      effectiveSlippage,
    )
  }
}

/**
 * Binary search approach to find the right input amount for exact output
 * Much more precise than the previous iterative approach
 */
async function binarySearchReverseRouting(
  denomIn: string,
  denomOut: string,
  targetAmountOut: BigNumber,
  assets: Asset[],
  chainConfig: ChainConfig,
  slippage: number,
): Promise<SwapRouteInfo | null> {
  // Work with integers from the start - convert target to integer
  const targetAmountOutInt = BN(toIntegerString(targetAmountOut))

  // Use slippage to define realistic search bounds
  let low = targetAmountOutInt.times(1 - slippage).integerValue(BigNumber.ROUND_CEIL) // Minimum amount (target - slippage)
  let high = targetAmountOutInt.times(1 + slippage).integerValue(BigNumber.ROUND_CEIL) // Maximum amount (target + slippage)
  let bestRoute: SwapRouteInfo | null = null
  let bestAmountIn = BN('0')

  const tolerance = BigNumber.max(BN(toIntegerString(targetAmountOutInt.times(0.0005))), BN('1')) // 0.05% tolerance, minimum 1
  const maxIterations = 10

  for (let i = 0; i < maxIterations; i++) {
    const mid = BN(toIntegerString(low.plus(high).dividedBy(2))) // Always integer

    try {
      const route = await getNeutronRouteInfoInternal(
        denomIn,
        denomOut,
        assets,
        chainConfig,
        { amountIn: mid.toString() },
        false,
        false,
      )

      if (!route || route.amountOut.isZero()) {
        low = mid.plus(1) // Try higher amount
        continue
      }

      const diff = route.amountOut.minus(targetAmountOutInt)

      // Save the best route so far
      if (!bestRoute || diff.abs().lt(bestRoute.amountOut.minus(targetAmountOutInt).abs())) {
        bestRoute = route
        bestAmountIn = mid
      }

      // Check if we're within tolerance
      if (diff.abs().lte(tolerance)) {
        break
      }

      // Adjust search range (keep integers)
      if (diff.gt(0)) {
        // We got more than needed, try smaller input
        high = mid.minus(1) // Ensure we don't get stuck
      } else {
        // We got less than needed, try larger input
        low = mid.plus(1) // Ensure we don't get stuck
      }
    } catch (error) {
      low = mid.plus(1) // Try higher amount on error (keep integers)
    }
  }

  if (bestRoute) {
    // Add the calculated amountIn to the route
    ;(bestRoute as any).amountIn = bestAmountIn
    return bestRoute
  }

  return null
}

export default async function getNeutronRouteInfo(
  denomIn: string,
  denomOut: string,
  amount: BigNumber,
  assets: Asset[],
  chainConfig: ChainConfig,
): Promise<SwapRouteInfo | null> {
  return getNeutronRouteInfoInternal(
    denomIn,
    denomOut,
    assets,
    chainConfig,
    { amountIn: amount.toString() },
    false, // isReverse
    true, // shouldFallbackToAstroport
  )
}
