import { useMemo } from 'react'

import useVaults from './useVaults'

export default function useVault(address: string) {
  const { data: vaults } = useVaults(false)

  return useMemo(() => vaults?.find((v) => v.address === address) ?? null, [vaults, address])
}
