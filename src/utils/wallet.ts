import { fromBech32, toBech32 } from '@cosmjs/encoding'

interface SkipAddresses {
  'noble-1': string
  'osmosis-1': string
  'neutron-1': string
}

export function convertToNeutronAddress(address?: string): string | null {
  if (!address || !address.includes('1')) return null
  const { data } = fromBech32(address)
  return toBech32('neutron', data)
}

export function convertToSkipAddresses(address?: string): SkipAddresses | null {
  if (!address) return null
  const { data } = fromBech32(address)
  const nobleAddress = toBech32('noble', data)
  const osmosisAddress = toBech32('osmo', data)
  const neutronAddress = toBech32('neutron', data)
  return { 'noble-1': nobleAddress, 'osmosis-1': osmosisAddress, 'neutron-1': neutronAddress }
}

export function convertToStargazeAddress(address?: string) {
  if (!address) return null
  const { data } = fromBech32(address)
  return toBech32('stars', data)
}
