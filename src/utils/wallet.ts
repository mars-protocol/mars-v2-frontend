import { fromBech32, toBech32 } from '@cosmjs/encoding'

export function convertToStargazeAddress(address?: string) {
  if (!address) return null
  const { data } = fromBech32(address)
  return toBech32('stars', data)
}
