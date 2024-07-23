import useChainConfig from 'hooks/chain/useChainConfig'
import { useMemo } from 'react'

export default function useIsOsmosis() {
  const chainConfig = useChainConfig()
  return useMemo(() => chainConfig.isOsmosis, [chainConfig])
}
