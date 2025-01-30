import useAccountIds from 'hooks/accounts/useAccountIds'
import { useMemo } from 'react'

export default function useNonHlsAccountIds(address?: string) {
  const { data: defaultAccountIds } = useAccountIds(address, true, 'default')
  const { data: vaultAccountIds } = useAccountIds(address, true, 'fund_manager')

  return useMemo(() => {
    if (!address) return []
    const mergedAccountIds = [...(defaultAccountIds ?? []), ...(vaultAccountIds ?? [])]

    return mergedAccountIds
  }, [address, defaultAccountIds, vaultAccountIds])
}
